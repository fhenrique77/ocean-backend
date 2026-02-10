const helloWorld = (req, res) => {
    res.send('Hello World')
}

const olaMundo = (req, res) => {
    res.send('Olá, mundo!')
}

export default {
    helloWorld,
    olaMundo
}
