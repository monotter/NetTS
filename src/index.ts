const ReplicatedStorage = game.GetService('ReplicatedStorage')
const RunService = game.GetService('RunService')
const IsServer = RunService.IsServer()
interface options { _player?: Player, [key: string | number ]: any }
interface Events { BindableEvent?: BindableEvent, RemoteEvent?: RemoteEvent, BindableFunction?: BindableFunction, RemoteFunction?: RemoteFunction }
export default class Net {
    private Listeners: Map<string, Array<Callback>>
    private RemoteListeners: Map<string, Array<Callback>>
    private FunctionListeners: Map<string, Callback>
    private FunctionRemoteListeners: Map<string, Callback>
    private Interacts: Events
    private eventName: string
    private specialParent: Instance
    private netFolderName: string
    private define() {
        if (IsServer) {
            let NetFolder: Folder
            let eventFolder: Folder
            // 'BindableEvent' | 'RemoteEvent' | 'BindableFunction' | 'RemoteFunction'
            if (this.specialParent.FindFirstChild(this.netFolderName)) {
                NetFolder = this.specialParent.FindFirstChild(this.netFolderName) as Folder
            } else {
                NetFolder = new Instance('Folder')
                NetFolder.Name = this.netFolderName
                NetFolder.SetAttribute('type', 'Server')
            }
            if (NetFolder.FindFirstChild(this.eventName)) {
                eventFolder = NetFolder!.FindFirstChild(this.eventName) as Folder
            } else {
                eventFolder = new Instance('Folder')
                eventFolder.Name = this.eventName
                eventFolder.SetAttribute('type', 'Server')
            }
            wait()
            ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                if (eventFolder.FindFirstChildOfClass(w as keyof Instances)) {
                    this.Interacts[w as 'RemoteEvent'] = eventFolder.FindFirstChildOfClass(w as 'RemoteEvent') as RemoteEvent
                } else {
                    this.Interacts[w as 'RemoteEvent'] = new Instance(w as 'RemoteEvent', eventFolder) as RemoteEvent
                }
            })
            this.Interacts['RemoteEvent']!.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
                const key = args[0] as string
                const options: options = (args[1] as object) || { }
                this.RemoteListeners.get(key)?.forEach((callback) => {
                    callback({ ...options, _player: player })
                })
            })
            this.Interacts['RemoteFunction']!.OnServerInvoke = ((player: Player, ...args: unknown[]) => {
                const key = args[0] as string
                const options: options = (args[1] as object) || { }
                if (!this.FunctionRemoteListeners.has(key)) return undefined
                const callback = this.FunctionRemoteListeners.get(key) as Callback
                return callback({ ...options, _player: player })
            })
            this.Interacts['BindableEvent']!.Event.Connect((key: string, options: options = {}) => {
                this.Listeners.get(key)?.forEach((callback) => {
                    callback({ ...options })
                })
            })
            this.Interacts['BindableFunction']!.OnInvoke = ((key: string, options: options = {}) => {
                while (!this.FunctionListeners.has(key)) { task.wait() }
                const callback = this.FunctionListeners.get(key) as Callback
                return callback({ ...options })
            })
            eventFolder.Parent = NetFolder
            NetFolder.Parent = this.specialParent
        } else {
            let NetFolder: Folder | undefined
            let eventFolder: Folder | undefined
            let status: 'netfolder' | 'netfolderclient' | 'eventfolder' | 'eventfolderclient' | 'ok' = 'ok'
            if (this.specialParent.FindFirstChild(this.netFolderName)) {
                NetFolder = this.specialParent.FindFirstChild(this.netFolderName) as Folder
                if (NetFolder.GetAttribute('type') === 'Server') {
                    if (NetFolder.FindFirstChild(this.eventName)) {
                        eventFolder = NetFolder.FindFirstChild(this.eventName) as Folder
                        if (eventFolder.GetAttribute('type') === 'Server') {
                            status = 'ok'
                        } else { status = 'eventfolderclient' }
                    } else { status = 'eventfolder' }
                } else { status = 'netfolderclient' }
            } else { status = 'netfolder' }

            if (status === 'netfolder') {
                NetFolder = new Instance('Folder')
                NetFolder.Name = this.netFolderName
                NetFolder.SetAttribute('type', 'Client')
                eventFolder = new Instance('Folder')
                eventFolder.SetAttribute('type', 'Client')
                eventFolder.Name = this.eventName
                eventFolder.Parent = NetFolder
                NetFolder.Parent = this.specialParent
                status = 'netfolderclient'
                ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                    this.Interacts[w as 'RemoteEvent'] = new Instance(w as 'RemoteEvent', eventFolder)
                    this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                })
            } else if (status === 'eventfolder') {
                eventFolder = new Instance('Folder')
                eventFolder.SetAttribute('type', 'Client')
                eventFolder.Name = this.eventName
                eventFolder.Parent = NetFolder
                status = 'eventfolderclient'
                ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                    this.Interacts[w as 'RemoteEvent'] = new Instance(w as 'RemoteEvent', eventFolder)
                    this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                })
            }
            if (status === 'ok') {
                ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                    this.Interacts[w as 'RemoteEvent'] = eventFolder!.FindFirstChildOfClass(w as 'RemoteEvent')
                    this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                })
            } else if (status === 'netfolderclient') {
                let conn: RBXScriptConnection
                conn = this.specialParent.ChildAdded.Connect((folder) => {
                    let _status: typeof status = 'ok'
                    if (!folder) { return }
                    if (!folder.IsA('Folder')) { return }
                    if (folder.Name !== this.netFolderName) { return }
                    if (folder.GetAttribute('type') !== 'Server') { return }
                    conn.Disconnect()
                    if (folder.FindFirstChild(this.eventName)) {
                        if (folder.FindFirstChild(this.eventName)!.GetAttribute('type') === 'Server') {
                            eventFolder!.Destroy()
                            eventFolder = folder.FindFirstChild(this.eventName) as Folder
                            wait()
                            ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                                this.Interacts[w as 'RemoteEvent'] = folder.FindFirstChildOfClass(w as 'RemoteEvent')
                                this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                            })
                        } else { _status = 'eventfolderclient' }
                    } else { _status = 'eventfolderclient' }
                    if (_status === 'eventfolderclient') {
                        eventFolder!.Parent = folder
                        let _conn: RBXScriptConnection
                        _conn = folder.ChildAdded.Connect((_folder) => {
                            if (!_folder) { return }
                            if (!_folder.IsA('Folder')) { return }
                            if (_folder.Name !== this.eventName) { return }
                            if (_folder.GetAttribute('type') !== 'Server') { return }
                            _conn.Disconnect()
                            eventFolder!.Destroy()
                            eventFolder = _folder
                            wait()
                            ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                                this.Interacts[w as 'RemoteEvent'] = _folder.FindFirstChildOfClass(w as 'RemoteEvent')
                                this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                            })
                        })
                    }
                    wait()
                    NetFolder?.Destroy()
                    NetFolder = folder
                })
            } else if (status === 'eventfolderclient') {
                let conn: RBXScriptConnection
                conn = NetFolder!.ChildAdded.Connect((folder) => {
                    if (!folder) { return }
                    if (!folder.IsA('Folder')) { return }
                    if (folder.Name !== this.eventName) { return }
                    if (folder.GetAttribute('type') !== 'Server') { return }
                    conn.Disconnect()
                    eventFolder!.Destroy()
                    eventFolder = folder
                    wait()
                    ;['BindableEvent', 'RemoteEvent', 'BindableFunction', 'RemoteFunction'].forEach((w: string) => {
                        this.Interacts[w as 'RemoteEvent'] = folder.FindFirstChildOfClass(w as 'RemoteEvent')
                        this.clientListen(this.Interacts as Required<Events>, w as 'RemoteEvent')
                    })
                })
            }
        }
    }
    constructor(EventWorkspace?: string, NetWorkspace?: string, Container?: Instance) {
        this.eventName = EventWorkspace || 'Main'
        this.netFolderName = NetWorkspace || '__Net__Workspace__'
        this.specialParent = Container || ReplicatedStorage
        this.Interacts = {}
        this.Listeners = new Map()
        this.RemoteListeners = new Map()
        this.FunctionListeners = new Map()
        this.FunctionRemoteListeners = new Map()
        this.define()
    }
    private clientListen(Ints: Required<Events>, _type: 'RemoteEvent' | 'RemoteFunction' | 'BindableEvent' | 'BindableFunction') {
        if (_type === 'RemoteEvent') {
            return Ints[_type].OnClientEvent.Connect((key: string, options: options = {}) => {
                this.RemoteListeners.get(key)?.forEach((callback) => {
                    callback({ ...options })
                })
            })
        } else if (_type === 'RemoteFunction') {
            Ints[_type].OnClientInvoke = ((key: string, options: options = {}) => {
                if (this.FunctionRemoteListeners.has(key)) {
                    const callback = this.FunctionRemoteListeners.get(key) as Callback
                    return callback({ ...options })
                } else {
                    return
                }
            })
            return
        } else if (_type === 'BindableEvent') {
            return Ints[_type].Event.Connect((key: string, options: options = {}) => {
                this.Listeners.get(key)?.forEach((callback) => {
                    callback({ ...options })
                })
            })
        } else if (_type === 'BindableFunction') {
            Ints[_type].OnInvoke = ((key: string, options: options = {}) => {
                while (!this.FunctionListeners.has(key)) { task.wait() }
                const callback = this.FunctionListeners.get(key) as Callback
                return callback({ ...options })
            })
            return
        }
    }
    public addRemoteListener(key: string, callback: Callback, IsFunction?: Boolean) {
        if (IsFunction) {
            this.FunctionRemoteListeners.set(key, callback)
        } else {
            if (!this.RemoteListeners.has(key)) {
                this.RemoteListeners.set(key, [])
            }
            this.RemoteListeners.get(key)?.push(callback)
        }
    }
    public removeRemoteListener(key: string, callback: Callback, IsFunction?: Boolean) {
        if (IsFunction) {
            this.FunctionRemoteListeners.delete(key)
        } else {
            if (this.RemoteListeners.has(key)) {
                const RemoteListeners = this.RemoteListeners.get(key)?.filter((_callback) => _callback !== callback)
                if (RemoteListeners && RemoteListeners.size() > 0) {
                    this.RemoteListeners.set(key, RemoteListeners)
                } else {
                    this.RemoteListeners.delete(key)
                }
            }
        }
    }
    public addListener(key: string, callback: Callback, IsFunction?: Boolean) {
        if (IsFunction) {
            this.FunctionListeners.set(key, callback)
        } else {
            if (!this.Listeners.has(key)) {
                this.Listeners.set(key, [])
            }
            this.Listeners.get(key)?.push(callback)
        }
    }
    public removeListener(key: string, callback: Callback, IsFunction?: Boolean) {
        if (IsFunction) {
            this.FunctionListeners.delete(key)
        } else {
            if (this.Listeners.has(key)) {
                const Listeners = this.Listeners.get(key)?.filter((_callback) => _callback !== callback)
                if (Listeners && Listeners.size() > 0) {
                    this.Listeners.set(key, Listeners)
                } else {
                    this.Listeners.delete(key)
                }
            }
        }
    }
    public emitRemote(key: string, options: options = {}, IsFunction?: Boolean) {
        if (IsServer) {
            if (IsFunction) {
                if (!options._player) {
                    return error('_player property must be specified')
                }
                let player = options._player
                options = {...options}
                delete options._player
                return this.Interacts.RemoteFunction!.InvokeClient(player, key, options)
            } else {
                if (options && options._player) {
                    let player = options._player
                    options = {...options}
                    delete options._player
                    this.Interacts.RemoteEvent!.FireClient(player, key, options)
                } else {
                    this.Interacts.RemoteEvent!.FireAllClients(key, options)
                }
            }
        } else {
            if (IsFunction) {
                while (!this.Interacts.RemoteFunction) { task.wait() }
                return this.Interacts.RemoteFunction.InvokeServer(key, options)
            } else {
                while (!this.Interacts.RemoteEvent) { task.wait() }
                this.Interacts.RemoteEvent.FireServer(key, options)
            }
        }
    }
    public emit(key: string, options: options = {}, IsFunction?: Boolean) {
        if (IsFunction) {
            return this.Interacts.BindableFunction?.Invoke(key, options)
        } else {
            this.Interacts.BindableEvent?.Fire(key, options)
        }
    }
}