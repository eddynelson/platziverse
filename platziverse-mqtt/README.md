#Platziverse-mqtt

Message broker

##agent/connected

```js

{
  agent: {
    uuid, // auto generar
    username, // definir
    hostname, // obtener de la computadora
    pid, // definir el proceso
    name, // definir 
    connected
  }
}

```

##agent/disconnected

```js
{
  agent: {
    uuid
  }
}
```

##agent/message

```js
{
  agent,
  metrics: [{ type, value }],
  timestamp, //lo generamos cuando creamos el mensage 
}
```