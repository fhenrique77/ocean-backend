import Personagem from '../models/Personagem.js'

const getNextId = async () => {
    const ultimo = await Personagem.findOne().sort({ id: -1 }).select({ id: 1 }).lean()
    return ultimo ? ultimo.id + 1 : 1
}

const listar = async () => Personagem.find().lean()

const buscarPorId = async (id) => Personagem.findOne({ id }).lean()

const existe = async (id) => {
    const count = await Personagem.countDocuments({ id })
    return count > 0
}

const criar = async (data) => {
    const id = data.id ?? (await getNextId())
    const payload = {
        url: data.url ?? `http://localhost:3000/personagens/${id}`,
        created: data.created ?? new Date().toISOString(),
        ...data,
        id
    }

    const personagem = await Personagem.create(payload)
    return personagem.toObject()
}

const atualizar = async (id, data) =>
    Personagem.findOneAndUpdate({ id }, data, { new: true, lean: true })

const remover = async (id) => Personagem.findOneAndDelete({ id }).lean()

const importarPorIds = async (ids) => {
    const baseUrl = 'https://rickandmortyapi.com/api/character'
    const requests = ids.map((id) => fetch(`${baseUrl}/${id}`))
    const responses = await Promise.all(requests)

    const falhas = responses.filter((response) => !response.ok)
    if (falhas.length > 0) {
        throw new Error('Falha ao buscar personagens na API externa.')
    }

    const personagens = await Promise.all(responses.map((response) => response.json()))
    const ops = personagens.map((personagem) => ({
        updateOne: {
            filter: { id: personagem.id },
            update: { $set: personagem },
            upsert: true
        }
    }))

    await Personagem.bulkWrite(ops)

    return personagens
}

const importarPorPagina = async (page) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)

    if (!response.ok) {
        throw new Error('Falha ao buscar personagens na API externa.')
    }

    const data = await response.json()
    const ops = data.results.map((personagem) => ({
        updateOne: {
            filter: { id: personagem.id },
            update: { $set: personagem },
            upsert: true
        }
    }))

    await Personagem.bulkWrite(ops)

    return data.results
}

export default {
    listar,
    buscarPorId,
    existe,
    criar,
    atualizar,
    remover,
    importarPorIds,
    importarPorPagina
}
