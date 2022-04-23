-- Compiled with roblox-ts v1.3.3
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local IsServer = RunService:IsServer()
local Net
do
	Net = setmetatable({}, {
		__tostring = function()
			return "Net"
		end,
	})
	Net.__index = Net
	function Net.new(...)
		local self = setmetatable({}, Net)
		return self:constructor(...) or self
	end
	function Net:constructor(EventWorkspace, NetWorkspace, Container)
		local _condition = EventWorkspace
		if not (_condition ~= "" and _condition) then
			_condition = "Main"
		end
		self.eventName = _condition
		local _condition_1 = NetWorkspace
		if not (_condition_1 ~= "" and _condition_1) then
			_condition_1 = "__Net__Workspace__"
		end
		self.netFolderName = _condition_1
		self.specialParent = Container or ReplicatedStorage
		self.Interacts = {}
		self.Listeners = {}
		self.RemoteListeners = {}
		self.FunctionListeners = {}
		self.FunctionRemoteListeners = {}
		self:define()
	end
	function Net:define()
		if IsServer then
			local NetFolder
			local eventFolder
			-- 'BindableEvent' | 'RemoteEvent' | 'BindableFunction' | 'RemoteFunction'
			if self.specialParent:FindFirstChild(self.netFolderName) then
				NetFolder = self.specialParent:FindFirstChild(self.netFolderName)
			else
				NetFolder = Instance.new("Folder")
				NetFolder.Name = self.netFolderName
				NetFolder:SetAttribute("type", "Server")
			end
			if NetFolder:FindFirstChild(self.eventName) then
				eventFolder = NetFolder:FindFirstChild(self.eventName)
			else
				eventFolder = Instance.new("Folder")
				eventFolder.Name = self.eventName
				eventFolder:SetAttribute("type", "Server")
			end
			local _arg0 = function(w)
				if eventFolder:FindFirstChildOfClass(w) then
					self.Interacts[w] = eventFolder:FindFirstChildOfClass(w)
				else
					self.Interacts[w] = Instance.new(w, eventFolder)
				end
			end
			local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
			for _k, _v in ipairs(_exp) do
				_arg0(_v, _k - 1, _exp)
			end
			self.Interacts.RemoteEvent.OnServerEvent:Connect(function(player, ...)
				local args = { ... }
				local key = args[1]
				local options = (args[2]) or {}
				local _result = self.RemoteListeners[key]
				if _result ~= nil then
					local _arg0_1 = function(callback)
						local _object = {}
						for _k, _v in pairs(options) do
							_object[_k] = _v
						end
						_object._player = player
						callback(_object)
					end
					for _k, _v in ipairs(_result) do
						_arg0_1(_v, _k - 1, _result)
					end
				end
			end)
			self.Interacts.RemoteFunction.OnServerInvoke = (function(player, ...)
				local args = { ... }
				local key = args[1]
				local options = (args[2]) or {}
				if not (self.FunctionRemoteListeners[key] ~= nil) then
					return nil
				end
				local callback = self.FunctionRemoteListeners[key]
				local _object = {}
				for _k, _v in pairs(options) do
					_object[_k] = _v
				end
				_object._player = player
				return callback(_object)
			end)
			self.Interacts.BindableEvent.Event:Connect(function(key, options)
				if options == nil then
					options = {}
				end
				local _result = self.Listeners[key]
				if _result ~= nil then
					local _arg0_1 = function(callback)
						local _object = {}
						for _k, _v in pairs(options) do
							_object[_k] = _v
						end
						callback(_object)
					end
					for _k, _v in ipairs(_result) do
						_arg0_1(_v, _k - 1, _result)
					end
				end
			end)
			self.Interacts.BindableFunction.OnInvoke = (function(key, options)
				if options == nil then
					options = {}
				end
				while not (self.FunctionListeners[key] ~= nil) do
					task.wait()
				end
				local callback = self.FunctionListeners[key]
				local _object = {}
				for _k, _v in pairs(options) do
					_object[_k] = _v
				end
				return callback(_object)
			end)
			eventFolder.Parent = NetFolder
			NetFolder.Parent = self.specialParent
		else
			local NetFolder
			local eventFolder
			local status = "ok"
			if self.specialParent:FindFirstChild(self.netFolderName) then
				NetFolder = self.specialParent:FindFirstChild(self.netFolderName)
				if NetFolder:GetAttribute("type") == "Server" then
					if NetFolder:FindFirstChild(self.eventName) then
						eventFolder = NetFolder:FindFirstChild(self.eventName)
						if eventFolder:GetAttribute("type") == "Server" then
							status = "ok"
						else
							status = "eventfolderclient"
						end
					else
						status = "eventfolder"
					end
				else
					status = "netfolderclient"
				end
			else
				status = "netfolder"
			end
			if status == "netfolder" then
				NetFolder = Instance.new("Folder")
				NetFolder.Name = self.netFolderName
				NetFolder:SetAttribute("type", "Client")
				eventFolder = Instance.new("Folder")
				eventFolder:SetAttribute("type", "Client")
				eventFolder.Name = self.eventName
				eventFolder.Parent = NetFolder
				NetFolder.Parent = self.specialParent
				status = "netfolderclient"
				local _arg0 = function(w)
					self.Interacts[w] = Instance.new(w, eventFolder)
					self:clientListen(self.Interacts, w)
				end
				local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
				for _k, _v in ipairs(_exp) do
					_arg0(_v, _k - 1, _exp)
				end
			elseif status == "eventfolder" then
				eventFolder = Instance.new("Folder")
				eventFolder:SetAttribute("type", "Client")
				eventFolder.Name = self.eventName
				eventFolder.Parent = NetFolder
				status = "eventfolderclient"
				local _arg0 = function(w)
					self.Interacts[w] = Instance.new(w, eventFolder)
					self:clientListen(self.Interacts, w)
				end
				local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
				for _k, _v in ipairs(_exp) do
					_arg0(_v, _k - 1, _exp)
				end
			end
			if status == "ok" then
				local _arg0 = function(w)
					self.Interacts[w] = eventFolder:FindFirstChildOfClass(w)
					self:clientListen(self.Interacts, w)
				end
				local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
				for _k, _v in ipairs(_exp) do
					_arg0(_v, _k - 1, _exp)
				end
			elseif status == "netfolderclient" then
				local conn
				conn = self.specialParent.ChildAdded:Connect(function(folder)
					local _status = "ok"
					if not folder then
						return nil
					end
					if not folder:IsA("Folder") then
						return nil
					end
					if folder.Name ~= self.netFolderName then
						return nil
					end
					if folder:GetAttribute("type") ~= "Server" then
						return nil
					end
					conn:Disconnect()
					if folder:FindFirstChild(self.eventName) then
						if folder:FindFirstChild(self.eventName):GetAttribute("type") == "Server" then
							eventFolder:Destroy()
							eventFolder = folder:FindFirstChild(self.eventName)
							wait()
							local _arg0 = function(w)
								self.Interacts[w] = folder:FindFirstChildOfClass(w)
								self:clientListen(self.Interacts, w)
							end
							local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
							for _k, _v in ipairs(_exp) do
								_arg0(_v, _k - 1, _exp)
							end
						else
							_status = "eventfolderclient"
						end
					else
						_status = "eventfolderclient"
					end
					if _status == "eventfolderclient" then
						eventFolder.Parent = folder
						local _conn
						_conn = folder.ChildAdded:Connect(function(_folder)
							if not _folder then
								return nil
							end
							if not _folder:IsA("Folder") then
								return nil
							end
							if _folder.Name ~= self.eventName then
								return nil
							end
							if _folder:GetAttribute("type") ~= "Server" then
								return nil
							end
							_conn:Disconnect()
							eventFolder:Destroy()
							eventFolder = _folder
							wait()
							local _arg0 = function(w)
								self.Interacts[w] = _folder:FindFirstChildOfClass(w)
								self:clientListen(self.Interacts, w)
							end
							local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
							for _k, _v in ipairs(_exp) do
								_arg0(_v, _k - 1, _exp)
							end
						end)
					end
					wait()
					local _result = NetFolder
					if _result ~= nil then
						_result:Destroy()
					end
					NetFolder = folder
				end)
			elseif status == "eventfolderclient" then
				local conn
				conn = NetFolder.ChildAdded:Connect(function(folder)
					if not folder then
						return nil
					end
					if not folder:IsA("Folder") then
						return nil
					end
					if folder.Name ~= self.eventName then
						return nil
					end
					if folder:GetAttribute("type") ~= "Server" then
						return nil
					end
					conn:Disconnect()
					eventFolder:Destroy()
					eventFolder = folder
					wait()
					local _arg0 = function(w)
						self.Interacts[w] = folder:FindFirstChildOfClass(w)
						self:clientListen(self.Interacts, w)
					end
					local _exp = { "BindableEvent", "RemoteEvent", "BindableFunction", "RemoteFunction" }
					for _k, _v in ipairs(_exp) do
						_arg0(_v, _k - 1, _exp)
					end
				end)
			end
		end
	end
	function Net:clientListen(Ints, _type)
		if _type == "RemoteEvent" then
			return Ints[_type].OnClientEvent:Connect(function(key, options)
				if options == nil then
					options = {}
				end
				local _result = self.RemoteListeners[key]
				if _result ~= nil then
					local _arg0 = function(callback)
						local _object = {}
						for _k, _v in pairs(options) do
							_object[_k] = _v
						end
						callback(_object)
					end
					for _k, _v in ipairs(_result) do
						_arg0(_v, _k - 1, _result)
					end
				end
			end)
		elseif _type == "RemoteFunction" then
			Ints[_type].OnClientInvoke = (function(key, options)
				if options == nil then
					options = {}
				end
				if self.FunctionRemoteListeners[key] ~= nil then
					local callback = self.FunctionRemoteListeners[key]
					local _object = {}
					for _k, _v in pairs(options) do
						_object[_k] = _v
					end
					return callback(_object)
				else
					return nil
				end
			end)
			return nil
		elseif _type == "BindableEvent" then
			return Ints[_type].Event:Connect(function(key, options)
				if options == nil then
					options = {}
				end
				local _result = self.Listeners[key]
				if _result ~= nil then
					local _arg0 = function(callback)
						local _object = {}
						for _k, _v in pairs(options) do
							_object[_k] = _v
						end
						callback(_object)
					end
					for _k, _v in ipairs(_result) do
						_arg0(_v, _k - 1, _result)
					end
				end
			end)
		elseif _type == "BindableFunction" then
			Ints[_type].OnInvoke = (function(key, options)
				if options == nil then
					options = {}
				end
				while not (self.FunctionListeners[key] ~= nil) do
					task.wait()
				end
				local callback = self.FunctionListeners[key]
				local _object = {}
				for _k, _v in pairs(options) do
					_object[_k] = _v
				end
				return callback(_object)
			end)
			return nil
		end
	end
	function Net:addRemoteListener(key, callback, IsFunction)
		if IsFunction then
			self.FunctionRemoteListeners[key] = callback
		else
			if not (self.RemoteListeners[key] ~= nil) then
				self.RemoteListeners[key] = {}
			end
			local _result = self.RemoteListeners[key]
			if _result ~= nil then
				table.insert(_result, callback)
			end
		end
	end
	function Net:removeRemoteListener(key, callback, IsFunction)
		if IsFunction then
			self.FunctionRemoteListeners[key] = nil
		else
			if self.RemoteListeners[key] ~= nil then
				local _RemoteListeners = self.RemoteListeners[key]
				if _RemoteListeners ~= nil then
					local _arg0 = function(_callback)
						return _callback ~= callback
					end
					-- ▼ ReadonlyArray.filter ▼
					local _newValue = {}
					local _length = 0
					for _k, _v in ipairs(_RemoteListeners) do
						if _arg0(_v, _k - 1, _RemoteListeners) == true then
							_length += 1
							_newValue[_length] = _v
						end
					end
					-- ▲ ReadonlyArray.filter ▲
					_RemoteListeners = _newValue
				end
				local RemoteListeners = _RemoteListeners
				if RemoteListeners and #RemoteListeners > 0 then
					self.RemoteListeners[key] = RemoteListeners
				else
					self.RemoteListeners[key] = nil
				end
			end
		end
	end
	function Net:addListener(key, callback, IsFunction)
		if IsFunction then
			self.FunctionListeners[key] = callback
		else
			if not (self.Listeners[key] ~= nil) then
				self.Listeners[key] = {}
			end
			local _result = self.Listeners[key]
			if _result ~= nil then
				table.insert(_result, callback)
			end
		end
	end
	function Net:removeListener(key, callback, IsFunction)
		if IsFunction then
			self.FunctionListeners[key] = nil
		else
			if self.Listeners[key] ~= nil then
				local _Listeners = self.Listeners[key]
				if _Listeners ~= nil then
					local _arg0 = function(_callback)
						return _callback ~= callback
					end
					-- ▼ ReadonlyArray.filter ▼
					local _newValue = {}
					local _length = 0
					for _k, _v in ipairs(_Listeners) do
						if _arg0(_v, _k - 1, _Listeners) == true then
							_length += 1
							_newValue[_length] = _v
						end
					end
					-- ▲ ReadonlyArray.filter ▲
					_Listeners = _newValue
				end
				local Listeners = _Listeners
				if Listeners and #Listeners > 0 then
					self.Listeners[key] = Listeners
				else
					self.Listeners[key] = nil
				end
			end
		end
	end
	function Net:emitRemote(key, options, IsFunction)
		if options == nil then
			options = {}
		end
		if IsServer then
			if IsFunction then
				if not options._player then
					return error("_player property must be specified")
				end
				local player = options._player
				local _object = {}
				for _k, _v in pairs(options) do
					_object[_k] = _v
				end
				options = _object
				options._player = nil
				return self.Interacts.RemoteFunction:InvokeClient(player, key, options)
			else
				if options and options._player then
					local player = options._player
					local _object = {}
					for _k, _v in pairs(options) do
						_object[_k] = _v
					end
					options = _object
					options._player = nil
					self.Interacts.RemoteEvent:FireClient(player, key, options)
				else
					self.Interacts.RemoteEvent:FireAllClients(key, options)
				end
			end
		else
			if IsFunction then
				while not self.Interacts.RemoteFunction do
					task.wait()
				end
				return self.Interacts.RemoteFunction:InvokeServer(key, options)
			else
				while not self.Interacts.RemoteEvent do
					task.wait()
				end
				self.Interacts.RemoteEvent:FireServer(key, options)
			end
		end
	end
	function Net:emit(key, options, IsFunction)
		if options == nil then
			options = {}
		end
		if IsFunction then
			local _result = self.Interacts.BindableFunction
			if _result ~= nil then
				_result = _result:Invoke(key, options)
			end
			return _result
		else
			local _result = self.Interacts.BindableEvent
			if _result ~= nil then
				_result:Fire(key, options)
			end
		end
	end
end
return {
	default = Net,
}
