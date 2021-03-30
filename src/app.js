var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients: {}
};

server.use(bodyParser.json());


model.reset = () => {
    model.clients = {}
}
/* clients = {
    javier: [{date:'22/10/2020 16:00'}], 
    alejandro: []
} */
model.addAppointment = (name, date) => {
    const clients = model.clients
    if(!clients[name]){
    clients[name] = [] //si no hago esta validacion no me corre esto, no se me acumulan las dates
}
    clients[name].push(date)
    // console.log(clients)
    // console.log(clients[name])
    // console.log(clients[name])
    date.status = "pending"
    // console.log(clients[name])
}

model.attend = (name, date) =>{
    const clients = model.clients
    if(clients[name]){
    const newDate = clients[name].find((obj)=> obj.date === date)
    console.log(newDate) //{ date: '22/10/2020 14:00', status: 'pending' }
    newDate.status = "attended"
    console.log(newDate) //{ date: '22/10/2020 14:00', status: 'attended' }
    return newDate
    }

}


model.expire = (name, date) =>{
    const clients = model.clients
    if(clients[name]){
    const newDate = clients[name].find((obj)=> obj.date === date)
    newDate.status = "expired"
    return newDate
    }
}
model.cancel = (name, date) =>{
    const clients = model.clients
    if(clients[name]){
    const newDate = clients[name].find((obj)=> obj.date === date)
    newDate.status = "cancelled"
    return newDate
    }
}

model.erase = (name, appointment) => {
//FIJARME SI NO LO PUEDO HACER DE UNA MANERA QUE LUEGO CUANGO HAGA EL GET A ESTA RUTA ME DEVUELVA EL ARRAY CON LOS ELEMENTOS Q YA ESTAN FILTRADOS
    
    const clients = model.clients
    var prop = "date" //aca lo que hacemos es guardar en prop el nombre de la propiedad del obj para luego poder acceder a el y compararlo
                    //  con el que nos mandan en appointment
                    //por defecto va a valer date
    if(appointment === "cancelled" || appointment === "expired" || appointment === "attended"){
        prop = "status" //pero si en appointment nos mandan cancelled, expired o attended es pq nos estan mandando el status, por eso prop 
                        // va a ser igual a status
    }
    if(clients[name]){
        clients[name] = clients[name].filter((obj)=>obj[prop] !== appointment) //filter normal, donde le decimos si obj[prop], que luego vendria a ser
        //obj[status] o obj[date] es diferente del appointment q nos pasan (q es el q van a querer eliminar), que lo deje en el array clients[name]
    }
}
model.getAppointments = (name, status) => {
    const clients = model.clients
    if(status){
        let filteredArray = []
        for(let obj of clients[name]){
            if(obj.status === status) filteredArray.push(obj)
        }
        return filteredArray
    }
    return clients[name]
}

model.getClients = () => {
    const clients = model.clients
    let array = []
    for(let key in clients){
        array.push(key)
    }
    return array
}
//API

server.get("/api", (req, res)=>{
    res.send(model.clients)
    
})

server.get( "/api/Appointments/clients", (req, res)=>{
    res.status(200).send(model.getClients())
}) //averiguar porque me anda si la pongo acá siendo que es el último test

server.post("/api/Appointments", (req, res)=>{
    // console.log(req.body) //esto es lo q en el test se manda en .send()
    const {client, appointment} = req.body
    if(!client){
         return res.status(400).send('the body must have a client property')
    }
    if(typeof client !== "string"){
        return res.status(400).send('client must be a string')
    }
    model.addAppointment(client, appointment)
    return res.send(appointment)
})
server.get("/api/Appointments/:name", (req, res)=> {
    //console.log(req.query) //por el query nos pasan el objeto con la fecha del appointment y en option el status
    //console.log(req.params) // y por params, nos pasan el nombre del cliente

    const {date, option} = req.query
    let client = req.params.name
    let clients = model.clients
    if(!clients[client]){
        return res.status(400).send("the client does not exist")
    }
        const appClient = clients[client].find((obj)=> obj.date === date)
        // console.log(option)
         if(!appClient){
            return res.status(400).send('the client does not have a appointment for that date')
        }
        else if(option === "attend"){
            return res.send(model.attend(client, date))
        }
        else if(option === "expire"){
            return res.send(model.expire(client, date))
        }
        else if(option === "cancel"){
             return res.send(model.cancel(client, date))
        }
        
        else if(option !== "expired" || option !== "attend" || option !== "cancel"){
            return res.status(400).send('the option must be attend, expire or cancel')
        }
})

server.get("/api/Appointments/:name/erase", (req, res)=> {
    //console.log(req.params.name) //imprime el nombre que nos pasan por params
    const {name} = req.params
    const clients = model.clients
    const {date} = req.query
    //console.log(name, date)
    //model.erase(name, date)
    //console.log(date)
    var prop = "date"
    if(date==="expired" || date==="cancelled" || date==="attended"){
        prop = "status"
    }
    //console.log(date)
    if(!clients[name]){
        return res.status(400).send('the client does not exist')
    }
    const arrayEliminados = clients[name].filter((obj)=>obj[prop] === date)
    
    model.erase(name, date) //acá importa el orden porque si pongo primero la ejecución de erase, el objeto ya queda filtrado, y cuando hago el filter de arriba nunca
                            //va a encontrar lo q quiero porque en erase elimino todos esos obj q busco para arrayEliminados
    res.send(arrayEliminados)
})
server.get("/api/Appointments/getAppointments/:name", (req, res)=>{
    const {name} = req.params
    const {status} = req.query
    console.log(name, status)
    res.send(model.getAppointments(name, status))
})


server.listen(3000);
module.exports = { model, server };
