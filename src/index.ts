import server from "./server";
import colors from 'colors'


// Definir un puerto en el que el servidor escuchará
const port = process.env.PORT || 4000

// Iniciar el servidor
server.listen(port, () => {
    console.log(colors.cyan.bold(`REST API funcionando en el puerto ${port}`));
})