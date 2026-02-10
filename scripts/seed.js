import connectDB from '../db/connection.js'
import personagensService from '../services/personagensService.js'

const run = async () => {
    await connectDB()

    const personagens = await personagensService.importarPorPagina(1)
    console.log(`Seed concluido: ${personagens.length} personagens importados.`)

    process.exit(0)
}

run().catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
})
