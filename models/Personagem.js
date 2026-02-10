import mongoose from 'mongoose'

const originSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        url: { type: String, default: '' }
    },
    { _id: false }
)

const locationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        url: { type: String, default: '' }
    },
    { _id: false }
)

const personagemSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
        species: { type: String, required: true },
        type: { type: String, default: '' },
        gender: { type: String, default: '' },
        origin: { type: originSchema, required: true },
        location: { type: locationSchema, required: true },
        image: { type: String, required: true },
        episode: { type: [String], default: [] },
        url: { type: String, default: '' },
        created: { type: String, default: '' }
    },
    { versionKey: false }
)

export default mongoose.model('Personagem', personagemSchema)
