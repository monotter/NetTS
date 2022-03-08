# NetTS

You can use with both RobloxTS and Plain LuaU

## installation and importing

### RobloxTS

```npm
npm install @rbxts/net-ts
```

```ts
import Net from '@rbxts/net-ts'

//              Event Workspace, Package Workspace, Package Container
const net = new Net('Character', 'ExcellentTech', game:GetService("ReplicatedStorage"))
// default Event Workspace: "Main"
// default Package Workspace: "__Net__Workspace__"
// default Container: ReplicatedStorage
```

### Roblox LuaU

```lua
local Net = require(game.ReplicatedStorage.Net).default
--                Event Workspace, Package Workspace, Package Container
local net = Net.new("Character", "ExcellentTech", game.ReplicatedStorage)
-- default Event Workspace: "Main"
-- default Package Workspace: "__Net__Workspace__"
-- default Container: ReplicatedStorage
```

## Events Usage

### server -> client

To send data on server to specific player, you have to specify `_player` property.

```ts
// receiver
net.addListener('random-event-name', ({ property1, property2, _player }) => {
    print(`b: ${a}, [d,e,f]: ${c} `)
})

// sender
net.emitRemote('random-event-name', { property1: 'example', property2: workspace, _player: game.Players.Monotter })
```

### server -> clients

if you do not specify `_player` it will automatically call `FireAllClients`.

```ts
// receiver
net.addRemoteListener('broadcast', ({ property1, property2 }: { property1: string, property2: Instance }) => {
    print(property2, property1)
})

// sender
net.emitRemote('broadcast', { property1: 'example', property2: workspace })
```

### client -> server

if you do not specify `_player` it will automatically call `FireAllClients`.

```ts
// receiver
net.addRemoteListener('kick-itself', ({ reason, _player }: { reason: string, _player: Player }) => {
    _player.Kick(reason)
})

// sender
net.emitRemote('kick-itself', { reason: 'uwu' })
```

### server -> server, client -> client

```ts
// receiver
net.addListener('randomEvent', ({ a, c }: { a: string, c: string[] }) => {
    print(`b: ${a}, [d,e,f]: ${c} `)
})

// sender
net.emit('randomEvent', { a: 'b', c: ['d', 'e', 'f'] })
```

## Function Usage

Currently `Function Usage` only supports one receiver per `event workspace`.

### clinet <-> client, server <-> server

```ts
// receiver
net.addListener('add', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 + num2 // -> now we can use return
}, true) // -> To making it function, simply add true at last parameter

// sender
const result = net.emit('add', { num1: 20, num2: 11 }, true) // -> Same stuff goes here!
print(result) // -> Result will be printed. ;)
```

### server <-> client

To server to client on `Function Usage` you must specify `_player`. (Since there can be only 1 return there must be only 1 client)

```ts
// receiver
net.addRemoteListener('multiply', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 * num2
}, true)

// sender
const result = net.emitRemote('multiply', { num1: 2, num2: 5, _player: game.Players.Monotter }, true)
print(result)
```

### client <-> server

```ts
// receiver
net.addRemoteListener('multiply', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 * num2
}, true)

// sender
const result = net.emitRemote('multiply', { num1: 2, num2: 5 }, true)
print(result)
```

## Important notice

I did not tested any examples that i wrote here, so there could be some issues about syntax.
