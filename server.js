import Fastify from 'fastify'
import { Pool } from 'pg'
import cors from '@fastify/cors'

const sql = new Pool({
    user: 'postgres',
    password: 'senai',
    host: 'localhost',
    port: 5432,
    database: 'bloco_notas'
})



const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})



servidor.get('/', async () => {
    return {
        mensagem: 'API do Bloco de Notas funcionando!'
    }
})



servidor.post('/login', async (request, reply) => {

    const body = request.body || {}

    const email = body.email
    const senha = body.senha

    if (!email || !senha) {
        return reply.status(400).send({
            mensagem: 'E-mail e senha são obrigatórios!'
        })
    }

    try {

        const resultado = await sql.query(
            `SELECT id, nome, email
             FROM usuario
             WHERE email = $1
             AND senha = $2
             AND ativo = TRUE`,
            [email, senha]
        )

        if (resultado.rows.length === 0) {
            return reply.status(401).send({
                mensagem: 'E-mail ou senha inválidos!',
                login: false
            })
        }

        return reply.status(200).send({
            mensagem: 'Usuário logado com sucesso!',
            login: true,
            usuario: resultado.rows[0]
        })

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao realizar login!'
        })
    }
})



servidor.get('/usuarios', async (request, reply) => {

    try {

        const resultado = await sql.query(
            `SELECT id, nome, email, ativo, criado_em
             FROM usuario
             ORDER BY id`
        )

        return reply.status(200).send(resultado.rows)

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao buscar usuários!'
        })
    }
})



servidor.get('/usuarios/:id', async (request, reply) => {

    const id = request.params.id

    try {

        const resultado = await sql.query(
            `SELECT id, nome, email, ativo, criado_em
             FROM usuario
             WHERE id = $1`,
            [id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Usuário não encontrado!'
            })
        }

        return reply.status(200).send(resultado.rows[0])

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao buscar usuário!'
        })
    }
})



servidor.post('/usuarios', async (request, reply) => {

    const body = request.body || {}

    const nome = body.nome
    const email = body.email
    const senha = body.senha

    if (!nome || !email || !senha) {
        return reply.status(400).send({
            mensagem: 'Nome, e-mail e senha são obrigatórios!'
        })
    }

    try {

        const resultado = await sql.query(
            `INSERT INTO usuario (nome, email, senha)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email, ativo, criado_em`,
            [nome, email, senha]
        )

        return reply.status(201).send({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: resultado.rows[0]
        })

    } catch (erro) {

        console.log(erro)

        if (erro.code === '23505') {
            return reply.status(400).send({
                mensagem: 'Este e-mail já está cadastrado!'
            })
        }

        return reply.status(500).send({
            mensagem: 'Erro ao cadastrar usuário!'
        })
    }
})



servidor.put('/usuarios/:id', async (request, reply) => {

    const id = request.params.id
    const body = request.body || {}

    const nome = body.nome
    const email = body.email
    const senha = body.senha

    if (!nome || !email || !senha) {
        return reply.status(400).send({
            mensagem: 'Nome, e-mail e senha são obrigatórios!'
        })
    }

    try {

        const resultado = await sql.query(
            `UPDATE usuario
             SET nome = $1,
                 email = $2,
                 senha = $3
             WHERE id = $4
             RETURNING id, nome, email, ativo, criado_em`,
            [nome, email, senha, id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Usuário não encontrado!'
            })
        }

        return reply.status(200).send({
            mensagem: 'Usuário alterado com sucesso!',
            usuario: resultado.rows[0]
        })

    } catch (erro) {

        console.log(erro)

        if (erro.code === '23505') {
            return reply.status(400).send({
                mensagem: 'Este e-mail já está cadastrado!'
            })
        }

        return reply.status(500).send({
            mensagem: 'Erro ao alterar usuário!'
        })
    }
})



servidor.delete('/usuarios/:id', async (request, reply) => {

    const id = request.params.id

    try {

        const resultado = await sql.query(
            `DELETE FROM usuario
             WHERE id = $1
             RETURNING id`,
            [id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Usuário não encontrado!'
            })
        }

        return reply.status(200).send({
            mensagem: 'Usuário excluído com sucesso!'
        })

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao excluir usuário!'
        })
    }
})



servidor.get('/notas', async (request, reply) => {

    try {

        const resultado = await sql.query(
            `SELECT
                nota.id,
                nota.titulo,
                nota.conteudo,
                nota.usuario_id,
                usuario.nome AS usuario_nome,
                nota.criada_em,
                nota.atualizada_em
             FROM nota
             INNER JOIN usuario
                 ON usuario.id = nota.usuario_id
             ORDER BY nota.id`
        )

        return reply.status(200).send(resultado.rows)

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao buscar notas!'
        })
    }
})



servidor.get('/notas/:id', async (request, reply) => {

    const id = request.params.id

    try {

        const resultado = await sql.query(
            `SELECT
                nota.id,
                nota.titulo,
                nota.conteudo,
                nota.usuario_id,
                usuario.nome AS usuario_nome,
                nota.criada_em,
                nota.atualizada_em
             FROM nota
             INNER JOIN usuario
                 ON usuario.id = nota.usuario_id
             WHERE nota.id = $1`,
            [id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Nota não encontrada!'
            })
        }

        return reply.status(200).send(resultado.rows[0])

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao buscar nota!'
        })
    }
})



servidor.get('/usuarios/:usuarioId/notas', async (request, reply) => {

    const usuarioId = request.params.usuarioId

    try {

        const resultado = await sql.query(
            `SELECT
                id,
                titulo,
                conteudo,
                usuario_id,
                criada_em,
                atualizada_em
             FROM nota
             WHERE usuario_id = $1
             ORDER BY id`,
            [usuarioId]
        )

        return reply.status(200).send(resultado.rows)

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao buscar as notas do usuário!'
        })
    }
})



servidor.post('/notas', async (request, reply) => {

    const body = request.body || {}

    const titulo = body.titulo
    const conteudo = body.conteudo
    const usuarioId = body.usuario_id

    if (!titulo || !conteudo || !usuarioId) {
        return reply.status(400).send({
            mensagem: 'Título, conteúdo e usuário são obrigatórios!'
        })
    }

    try {

        const usuario = await sql.query(
            `SELECT id
             FROM usuario
             WHERE id = $1
             AND ativo = TRUE`,
            [usuarioId]
        )

        if (usuario.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Usuário não encontrado!'
            })
        }

        const resultado = await sql.query(
            `INSERT INTO nota (
                titulo,
                conteudo,
                usuario_id
             )
             VALUES ($1, $2, $3)
             RETURNING *`,
            [titulo, conteudo, usuarioId]
        )

        return reply.status(201).send({
            mensagem: 'Nota cadastrada com sucesso!',
            nota: resultado.rows[0]
        })

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao cadastrar nota!'
        })
    }
})



servidor.put('/notas/:id', async (request, reply) => {

    const id = request.params.id
    const body = request.body || {}

    const titulo = body.titulo
    const conteudo = body.conteudo
    const usuarioId = body.usuario_id

    if (!titulo || !conteudo || !usuarioId) {
        return reply.status(400).send({
            mensagem: 'Título, conteúdo e usuário são obrigatórios!'
        })
    }

    try {

        const resultado = await sql.query(
            `UPDATE nota
             SET titulo = $1,
                 conteudo = $2,
                 usuario_id = $3,
                 atualizada_em = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [titulo, conteudo, usuarioId, id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Nota não encontrada!'
            })
        }

        return reply.status(200).send({
            mensagem: 'Nota alterada com sucesso!',
            nota: resultado.rows[0]
        })

    } catch (erro) {

        console.log(erro)

        if (erro.code === '23503') {
            return reply.status(400).send({
                mensagem: 'O usuário informado não existe!'
            })
        }

        return reply.status(500).send({
            mensagem: 'Erro ao alterar nota!'
        })
    }
})



servidor.delete('/notas/:id', async (request, reply) => {

    const id = request.params.id

    try {

        const resultado = await sql.query(
            `DELETE FROM nota
             WHERE id = $1
             RETURNING id`,
            [id]
        )

        if (resultado.rows.length === 0) {
            return reply.status(404).send({
                mensagem: 'Nota não encontrada!'
            })
        }

        return reply.status(200).send({
            mensagem: 'Nota excluída com sucesso!'
        })

    } catch (erro) {

        console.log(erro)

        return reply.status(500).send({
            mensagem: 'Erro ao excluir nota!'
        })
    }
})



const iniciarServidor = async () => {

    try {

        await servidor.listen({
            port: 3000,
            host: '0.0.0.0'
        })

        console.log('Servidor rodando em http://localhost:3000')

    } catch (erro) {

        console.log(erro)
        process.exit(1)
    }
}

iniciarServidor()