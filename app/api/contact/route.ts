import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'menarim.nao.responda@gmail.com',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER || 'menarim.nao.responda@gmail.com',
      to: 'vendas@conexabr277.com.br',
      replyTo: email,
      subject: `Nova mensagem de contato - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0949a9; border-bottom: 3px solid #fbbf24; padding-bottom: 10px;">
            Nova Mensagem do Formulário de Contato
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #0949a9;">Nome:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #0949a9;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #0949a9;">Telefone:</strong> ${phone}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #fbbf24; margin: 20px 0;">
            <h3 style="color: #0949a9; margin-top: 0;">Mensagem:</h3>
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>Esta mensagem foi enviada através do formulário de contato do site.</p>
            <p>Para responder, use o email: ${email}</p>
          </div>
        </div>
      `,
      text: `
Nova Mensagem do Formulário de Contato

Nome: ${name}
Email: ${email}
Telefone: ${phone}

Mensagem:
${message}

---
Esta mensagem foi enviada através do formulário de contato do site.
Para responder, use o email: ${email}
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}



