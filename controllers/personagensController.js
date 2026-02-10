import personagensService from '../services/personagensService.js'

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const isValidHttpUrl = (value) => {
    if (!isNonEmptyString(value)) {
        return false
    }

    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (error) {
        return false
    }
}

const isRickAndMortyImage = (value) => {
    if (!isValidHttpUrl(value)) {
        return false
    }

    const url = new URL(value)
    if (url.host !== 'rickandmortyapi.com') {
        return false
    }

    return url.pathname.startsWith('/api/character/avatar/')
}

const getIdFromParams = (req, res) => {
    const id = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).send('O id deve ser um numero inteiro maior que zero.')
        return null
    }

    return id
}

const getStringFromBody = (req, res, campo, obrigatorio) => {
    const valor = req.body?.[campo]

    if (!isNonEmptyString(valor)) {
        if (obrigatorio) {
            res.status(400).send(`O campo ${campo} e obrigatorio.`)
            return null
        }

        return undefined
    }

    return valor.trim()
}

const getUrlFromBody = (req, res, campo, obrigatorio) => {
    const valor = req.body?.[campo]

    if (valor === undefined) {
        if (obrigatorio) {
            res.status(400).send(`O campo ${campo} e obrigatorio.`)
            return null
        }

        return undefined
    }

    if (!isValidHttpUrl(valor)) {
        res.status(400).send(`O campo ${campo} deve ser uma URL http/https valida.`)
        return null
    }

    return valor.trim()
}

const getOriginFromBody = (req, res, obrigatorio) => {
    const origin = req.body?.origin

    if (!origin || typeof origin !== 'object') {
        if (obrigatorio) {
            res.status(400).send('O campo origin e obrigatorio.')
            return null
        }

        return undefined
    }

    if (!isNonEmptyString(origin.name)) {
        res.status(400).send('O campo origin.name e obrigatorio.')
        return null
    }

    if (origin.url !== undefined && !isValidHttpUrl(origin.url)) {
        res.status(400).send('O campo origin.url deve ser uma URL valida.')
        return null
    }

    return {
        name: origin.name.trim(),
        url: isNonEmptyString(origin.url) ? origin.url.trim() : ''
    }
}

const getLocationFromBody = (req, res, obrigatorio) => {
    const location = req.body?.location

    if (!location || typeof location !== 'object') {
        if (obrigatorio) {
            res.status(400).send('O campo location e obrigatorio.')
            return null
        }

        return undefined
    }

    if (!isNonEmptyString(location.name)) {
        res.status(400).send('O campo location.name e obrigatorio.')
        return null
    }

    if (location.url !== undefined && !isValidHttpUrl(location.url)) {
        res.status(400).send('O campo location.url deve ser uma URL valida.')
        return null
    }

    return {
        name: location.name.trim(),
        url: isNonEmptyString(location.url) ? location.url.trim() : ''
    }
}

const getUrlArrayFromBody = (req, res, campo) => {
    const valor = req.body?.[campo]

    if (valor === undefined) {
        return undefined
    }

    if (!Array.isArray(valor)) {
        res.status(400).send(`O campo ${campo} deve ser uma lista de URLs.`)
        return null
    }

    if (!valor.every((item) => isValidHttpUrl(item))) {
        res.status(400).send(`O campo ${campo} deve conter URLs validas.`)
        return null
    }

    return valor
}

const validarPersonagemExiste = async (id, res) => {
    const existe = await personagensService.existe(id)

    if (!existe) {
        res.status(404).send('Personagem nao encontrado.')
        return false
    }

    return true
}

const buildPayload = (req, res, obrigatorio) => {
    const name = getStringFromBody(req, res, 'name', obrigatorio)
    if (name === null) {
        return null
    }

    const status = getStringFromBody(req, res, 'status', obrigatorio)
    if (status === null) {
        return null
    }

    const species = getStringFromBody(req, res, 'species', obrigatorio)
    if (species === null) {
        return null
    }

    const type = getStringFromBody(req, res, 'type', false)
    if (type === null) {
        return null
    }

    const gender = getStringFromBody(req, res, 'gender', false)
    if (gender === null) {
        return null
    }

    const origin = getOriginFromBody(req, res, obrigatorio)
    if (origin === null) {
        return null
    }

    const location = getLocationFromBody(req, res, obrigatorio)
    if (location === null) {
        return null
    }

    const image = getUrlFromBody(req, res, 'image', obrigatorio)
    if (image === null) {
        return null
    }

    if (image !== undefined && !isRickAndMortyImage(image)) {
        res.status(400).send('A imagem deve vir da API Rick and Morty.')
        return null
    }

    const episode = getUrlArrayFromBody(req, res, 'episode')
    if (episode === null) {
        return null
    }

    const url = getUrlFromBody(req, res, 'url', false)
    if (url === null) {
        return null
    }

    const created = getStringFromBody(req, res, 'created', false)
    if (created === null) {
        return null
    }

    const payload = {
        ...(name !== undefined ? { name } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(species !== undefined ? { species } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(origin !== undefined ? { origin } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(episode !== undefined ? { episode } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(created !== undefined ? { created } : {})
    }

    return payload
}

const listar = async (req, res) => {
    const lista = await personagensService.listar()
    res.send(lista)
}

const buscarPorId = async (req, res) => {
    const id = getIdFromParams(req, res)
    if (!id) {
        return
    }

    if (!(await validarPersonagemExiste(id, res))) {
        return
    }

    const personagem = await personagensService.buscarPorId(id)
    res.send(personagem)
}

const criar = async (req, res) => {
    const payload = buildPayload(req, res, true)
    if (!payload) {
        return
    }

    const personagem = await personagensService.criar({
        episode: [],
        ...payload
    })
    res.status(201).send(personagem)
}

const atualizar = async (req, res) => {
    const id = getIdFromParams(req, res)
    if (!id) {
        return
    }

    const payload = buildPayload(req, res, false)
    if (!payload) {
        return
    }

    if (Object.keys(payload).length === 0) {
        res.status(400).send('Nenhum campo valido para atualizar.')
        return
    }

    if (!(await validarPersonagemExiste(id, res))) {
        return
    }

    const personagem = await personagensService.atualizar(id, payload)

    res.send(personagem)
}

const remover = async (req, res) => {
    const id = getIdFromParams(req, res)
    if (!id) {
        return
    }

    if (!(await validarPersonagemExiste(id, res))) {
        return
    }

    await personagensService.remover(id)

    res.send('Personagem removido com sucesso!')
}

const importar = async (req, res) => {
    const ids = req.body?.ids
    const page = req.body?.page

    if (ids === undefined && page === undefined) {
        res.status(400).send('Informe ids ou page para importar.')
        return
    }

    if (ids !== undefined) {
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).send('O campo ids deve ser uma lista com pelo menos um id.')
            return
        }

        const parsed = ids.map((id) => Number.parseInt(id, 10))
        if (!parsed.every((id) => Number.isInteger(id) && id > 0)) {
            res.status(400).send('O campo ids deve conter ids validos.')
            return
        }

        try {
            const personagens = await personagensService.importarPorIds(parsed)
            res.status(201).send({ total: personagens.length, personagens })
        } catch (error) {
            res.status(502).send('Falha ao importar personagens da API externa.')
        }

        return
    }

    const pagina = Number.parseInt(page, 10)
    if (!Number.isInteger(pagina) || pagina <= 0) {
        res.status(400).send('O campo page deve ser um numero inteiro maior que zero.')
        return
    }

    try {
        const personagens = await personagensService.importarPorPagina(pagina)
        res.status(201).send({ total: personagens.length, personagens })
    } catch (error) {
        res.status(502).send('Falha ao importar personagens da API externa.')
    }
}

export default {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover,
    importar
}
