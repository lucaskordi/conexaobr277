#!/usr/bin/env python3

import pandas as pd
import sys
import os
import re

def read_excel_file(file_path):
    try:
        if file_path.endswith('.xls'):
            df = pd.read_excel(file_path, engine='xlrd', header=None)
        else:
            df = pd.read_excel(file_path, engine='openpyxl', header=None)
        return df
    except Exception as e:
        print(f"Erro ao ler arquivo {file_path}: {e}")
        return None

def find_header_row(df):
    for idx, row in df.iterrows():
        row_str = ' '.join([str(val) for val in row.values if pd.notna(val)])
        if 'REGIÃO' in row_str.upper() or 'REGIAO' in row_str.upper():
            return idx
    return None

def parse_weight_range(weight_str):
    if pd.isna(weight_str):
        return None, None
    
    weight_str = str(weight_str).strip()
    
    if 'a' in weight_str.lower():
        parts = re.split(r'\s+a\s+', weight_str, flags=re.IGNORECASE)
        if len(parts) == 2:
            try:
                min_part = parts[0].strip().replace(',', '.').strip()
                max_part = parts[1].strip().replace(',', '.').strip()
                
                min_part = re.sub(r'kg', '', min_part, flags=re.IGNORECASE).strip()
                max_part = re.sub(r'kg', '', max_part, flags=re.IGNORECASE).strip()
                
                min_weight = float(min_part)
                max_weight = float(max_part)
                return min_weight, max_weight
            except Exception as e:
                pass
    
    if '-' in weight_str and not weight_str.startswith('-'):
        parts = weight_str.split('-', 1)
        if len(parts) == 2:
            try:
                min_weight = float(parts[0].strip().replace(',', '.').replace('kg', '').strip())
                max_weight = float(parts[1].strip().replace(',', '.').replace('kg', '').strip())
                return min_weight, max_weight
            except:
                pass
    
    if 'excedente' in weight_str.lower():
        try:
            num = float(re.findall(r'[\d,]+', weight_str.replace(',', '.'))[0])
            return num, None
        except:
            pass
    
    return None, None

def parse_delivery_days(days_str):
    if pd.isna(days_str):
        return None
    
    days_str = str(days_str).strip()
    
    if 'a' in days_str.lower() or '-' in days_str:
        parts = re.split(r'[a\-]', days_str, maxsplit=1)
        if len(parts) == 2:
            try:
                min_days = int(float(parts[0].strip()))
                return min_days
            except:
                pass
    
    try:
        return int(float(days_str))
    except:
        return None

def get_cep_range_by_uf(uf):
    cep_ranges = {
        'AC': (69900000, 69999999),
        'AL': (57000000, 57999999),
        'AP': (68900000, 68999999),
        'AM': (69000000, 69299999),
        'BA': (40000000, 48999999),
        'CE': (60000000, 63999999),
        'DF': (70000000, 72799999),
        'ES': (29000000, 29999999),
        'GO': (72800000, 76799999),
        'MA': (65000000, 65999999),
        'MT': (78000000, 78899999),
        'MS': (79000000, 79999999),
        'MG': (30000000, 39999999),
        'PA': (66000000, 68899999),
        'PB': (58000000, 58999999),
        'PR': (80000000, 87999999),
        'PE': (50000000, 56999999),
        'PI': (64000000, 64999999),
        'RJ': (20000000, 28999999),
        'RN': (59000000, 59999999),
        'RS': (90000000, 99999999),
        'RO': (76800000, 76999999),
        'RR': (69300000, 69399999),
        'SC': (88000000, 89999999),
        'SP': (1000000, 19999999),
        'SE': (49000000, 49999999),
        'TO': (77000000, 77999999),
    }
    return cep_ranges.get(uf.upper(), (1000000, 99999999))

def convert_transportadora_to_yampi(transportadora_file, output_file):
    print("Lendo planilha de transporte...")
    df = read_excel_file(transportadora_file)
    
    if df is None:
        print("Erro ao ler planilha")
        return False
    
    header_row = find_header_row(df)
    if header_row is None:
        print("Não foi possível encontrar o cabeçalho")
        return False
    
    print(f"Cabeçalho encontrado na linha {header_row}")
    
    headers = df.iloc[header_row].values
    data_df = df.iloc[header_row + 1:].copy()
    data_df.columns = range(len(headers))
    
    print(f"\nCabeçalhos identificados:")
    for i, h in enumerate(headers[:15]):
        if pd.notna(h):
            print(f"  Col {i}: {h}")
    
    weight_range_columns = []
    excess_price_col = None
    
    for i, h in enumerate(headers):
        if pd.notna(h):
            h_str = str(h).strip()
            
            if 'excedente' in h_str.lower() or ('kg' in h_str.lower() and 'excedente' in h_str.lower()):
                excess_price_col = i
                print(f"  Coluna de preço excedente encontrada: Col {i} - {h_str}")
            
            if re.search(r'\d+[.,]?\d*\s*a\s*\d+[.,]?\d*\s*kg', h_str, re.IGNORECASE):
                weight_range_columns.append((i, h_str))
    
    if not weight_range_columns:
        row_after_header = df.iloc[header_row + 1] if header_row + 1 < len(df) else None
        if row_after_header is not None:
            for i, val in enumerate(row_after_header.values):
                if pd.notna(val):
                    val_str = str(val).strip()
                    if re.search(r'\d+[.,]?\d*\s*a\s*\d+[.,]?\d*\s*kg', val_str, re.IGNORECASE):
                        weight_range_columns.append((i, val_str))
    
    print(f"\nColunas de faixa de peso encontradas: {len(weight_range_columns)}")
    for col_idx, col_name in weight_range_columns:
        print(f"  Col {col_idx}: {col_name}")
    
    yampi_rows = []
    current_region = None
    current_uf = None
    
    for idx, row in data_df.iterrows():
        if idx > 200:
            break
        
        region = row[0] if pd.notna(row[0]) else current_region
        uf = row[1] if pd.notna(row[1]) else current_uf
        destino = row[2] if pd.notna(row[2]) else None
        
        if pd.notna(region):
            current_region = str(region).strip()
        if pd.notna(uf):
            current_uf = str(uf).strip()
        
        if not current_region or not current_uf:
            continue
        
        cep_inicial, cep_final = get_cep_range_by_uf(current_uf)
        
        delivery_days = 5
        if len(row) > 17:
            days_col_17 = row[17] if pd.notna(row[17]) else None
            days_col_18 = row[18] if len(row) > 18 and pd.notna(row[18]) else None
            days_col_19 = row[19] if len(row) > 19 and pd.notna(row[19]) else None
            
            if days_col_17 is not None:
                try:
                    days_col_17_str = str(days_col_17).strip()
                    if days_col_18 and str(days_col_18).strip().lower() == 'a':
                        if days_col_19 is not None:
                            try:
                                delivery_days = int(float(days_col_19))
                            except:
                                delivery_days = int(float(days_col_17))
                        else:
                            delivery_days = int(float(days_col_17))
                    else:
                        delivery_days = int(float(days_col_17))
                except:
                    pass
        
        excess_price = row[excess_price_col] if excess_price_col is not None and excess_price_col < len(row) and pd.notna(row[excess_price_col]) else 0
        try:
            excess_price = float(excess_price) if excess_price else 0
        except:
            excess_price = 0
        
        for col_idx, col_name in weight_range_columns:
            if col_idx >= len(row):
                continue
            
            freight_value = row[col_idx]
            if pd.isna(freight_value):
                continue
            
            try:
                freight_value = float(freight_value)
            except:
                continue
            
            min_weight, max_weight = parse_weight_range(col_name)
            
            if min_weight is None:
                continue
            
            if max_weight is None:
                max_weight = 999
            
            peso_inicial_grams = int(round(min_weight * 1000))
            peso_final_grams = int(round(max_weight * 1000))
            
            if peso_final_grams <= peso_inicial_grams:
                continue
            valor_frete_cents = int(round(freight_value * 100))
            valor_extra_cents = int(round(excess_price * 100)) if excess_price else 0
            
            yampi_row = {
                'regiao': f"{current_region} - {current_uf}",
                'cep_inicial': int(cep_inicial),
                'cep_final': int(cep_final),
                'peso_inicial': peso_inicial_grams,
                'peso_final': peso_final_grams,
                'valor_frete': valor_frete_cents,
                'valor_extra_por_peso': valor_extra_cents,
                'dias_para_entrega': delivery_days,
                'porcentagem_adicional': 0
            }
            
            yampi_rows.append(yampi_row)
    
    if not yampi_rows:
        print("Nenhuma linha convertida")
        return False
    
    result_df = pd.DataFrame(yampi_rows)
    
    print(f"\n{'='*60}")
    print(f"CONVERSÃO CONCLUÍDA")
    print(f"{'='*60}")
    print(f"Total de linhas convertidas: {len(result_df)}")
    print(f"\nPrimeiras 5 linhas:")
    print(result_df.head().to_string())
    
    result_df.to_excel(output_file, index=False, engine='openpyxl')
    print(f"\n✅ Arquivo salvo em: {output_file}")
    
    return True

def main():
    input_file = "Planilha Transportadora.xlsx"
    output_file = "Planilha de Frete Yampi Convertida.xlsx"
    template_file = "Planilha de Frete Modelo Todo o Brasil.xls"
    
    if not os.path.exists(input_file):
        print(f"Erro: Arquivo {input_file} não encontrado")
        return
    
    print("="*60)
    print("CONVERSOR DE PLANILHA DE FRETE")
    print("="*60)
    
    success = convert_transportadora_to_yampi(input_file, output_file)
    
    if success:
        print("\n✅ Conversão concluída com sucesso!")
    else:
        print("\n❌ Erro na conversão")

if __name__ == "__main__":
    main()
