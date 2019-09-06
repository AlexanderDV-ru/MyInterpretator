code.value=window.localStorage["myInterpretator.codeText"]
code.oninput=function(e)
{
	window.localStorage["myInterpretator.codeText"]=code.value
}
code.onkeydown=function(e)
{
	if(e.key=="Tab")
	{
		code.value=code.value.substring(0,code.selectionStart)+"\t"+code.value.substring(code.selectionStart+1,code.value.length)
		return false
	}
}
execute.onclick=function(e)
{
	var mainPool={}
	output.value=""
	var strTo=function(str,pools)
	{
		var genPool={}
		for(var v in pools)
			for(var i in pools[v])
				genPool[i]=pools[v][i]
		console.log(genPool)			
			
		var splitters="+-*/^"
		for(var v in splitters)
		{
			var splited=str.split(splitters[v])
			if(splited.length!=1)
			{
				var res
				for(var i in splited)
				{
					if(i==0)
					{
						res=strTo(splited[i],pools)
						continue
					}
					
					var sec=strTo(splited[i],pools)
					switch(splitters[v]+res.type[0]+sec.type[0])
					{
						case "+nn":
							res={"type":"num","value":res.value+sec.value}
							break
						case "-nn":
							res={"type":"num","value":res.value-sec.value}
							break
						case "*nn":
							res={"type":"num","value":res.value*sec.value}
							break
						case "/nn":
							res={"type":"num","value":res.value/sec.value}
							break
							
						case "^nn":
						case "^ns":
						case "^ss":
						case "^sn":
							res={"type":"str","value":res.value+""+sec.value}
							break
							
						case "+sn":
							res={"type":"str","value":res.value+res.value.substring(0,sec.value)}
							break
						case "-sn":
							res={"type":"str","value":res.value.substring(0,res.value.length-sec.value)}
							break
						case "*sn":
							res={"type":"str","value":res.value+res.value.substring(0,res.value.length*sec.value)}
							break
						case "/sn":
							res={"type":"str","value":res.value.substring(0,res.value.length/sec.value)}
							break
							
						//case "+ss":
						//	res={"type":"str","value":res.value+res.value.substring(0,sec.value)}
						//	break
						//case "-ss":
						//	res={"type":"str","value":res.value.substring(0,res.value.length-sec.value)}
						//	break
						//case "*ss":
						//	res={"type":"str","value":res.value+res.value.substring(0,res.value.length*sec.value)}
						//	break
						//case "/ss":
						//	res={"type":"str","value":res.value.substring(0,res.value.length/sec.value)}
						//	break
							
						case "+ns":
							res={"type":"str","value":sec.value.substring(0,res.value)+sec.value}
							break
						case "-ns":
							res={"type":"str","value":sec.value.substring(res.value,sec.value.length)}
							break
						case "*ns":
							res={"type":"str","value":sec.value.substring(0,sec.value.length*res.value)+sec.value}
							break
						case "/ns":
							res={"type":"str","value":sec.value.substring(0,sec.value.length/res.value)}
							break
					}
				}
				return res
			}
		}
		if(str[0]=="\""&&str[str.length-1]=="\"")
			return {"type":"str","value":str.substring(1,str.length-1).replace(/\\t/g,"\t").replace(/\\n/g,"\n").replace(/\\s/g," ")}
		if(str[0]=="/"&&str[str.length-1]=="/")
			return {"type":"regexp","value":str.substring(1,str.length-1).replace(/\\t/g,"\t").replace(/\\n/g,"\n").replace(/\\s/g," ")}
		if(str[0]=="{"&&str[str.length-1]=="}")
			return {"type":"json","value":JSON.parse(str.substring(1,str.length-1).replace(/\\t/g,"\t").replace(/\\n/g,"\n").replace(/\\s/g," "))}
		if(str[0]=="#"&&str[str.length-1]=="#")
			return {"type":"num","value":Number(str.substring(1,str.length-1))}
		if(str.indexOf("[")!=-1)
		{
			var variable=strTo(str.substring(0,str.indexOf("[")),pools)
			var inBrackets=str.substring(str.indexOf("[")+1,str.indexOf("]"))
			var res=variable.type=="str"?"":[]
			var add=function(adding)
			{
				if(variable.type=="str")
					res+=adding
				else res.push(adding)
			}
			var proc=function(number)
			{
				return (number%variable.value.length+variable.value.length)%variable.value.length
			}
			var pools2=[]
			for(var v in pools)
				pools2[v]=pools[v]
			pools2.push({})
			var vv=Object.keys(variable.value)
			for(var v in vv)
				pools2[pools2.length-1][vv[v]]={"type":"num","value":variable.value[vv[v]]}
			pools2[pools2.length-1]["length"]=variable.value.length
			console.log(variable)
			var splited=inBrackets.split(",")
			for(var v in splited)
			{
				var elems=splited[v].split(":")
				console.log(elems)
				console.log(pools2)
				if(!elems[1]&&elems[1]!="")
					add(variable.value[strTo(elems[0],pools2).value])
				else for(var i=(elems[0]==""?0:strTo(elems[0],pools2).value);i<=(elems[1]==""?variable.value.length-1:strTo(elems[1],pools2).value);i++)
					add(variable.value[proc(i)])
			}
			return {"type":res.length==1?(variable.type=="str"?"char":res[0].type):(variable.type=="str"?"str":"array"),"value":res.length==1?res[0]:res}
			
			
			var br0=(Number(inBrackets.split(",")[0])%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length
			var br1=(Number(inBrackets.split(",")[1])%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length
			var br2=(Number(inBrackets.split(",")[2])%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length
			var br3=(Number(inBrackets.split(",")[3])%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length
			var isForward=br0<br1&&br1!=NaN||br3!=NaN&&br1==NaN&&br3>0
			var start=(isForward?br0:br1), end=(isForward?br1:br0), length=(isForward?br3:-br3)
			console.log(br0)
			console.log(br1)
			console.log(br2)
			console.log(br3)
			for(var i=(isForward?0:beforeBrackets.value.length-1);(isForward?i<beforeBrackets.value.length:i>=0);i+=(isForward?1:-1))
			{
				console.log(i)
				if(Number(inBrackets.split(",")[1])==NaN?br0==i:start<=i&&(end>i||end==0))
				{
					console.log("r")
					if(bracketed.type=="str")
						bracketed.value+=beforeBrackets.value[(i%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length]
					else bracketed.value.push(beforeBrackets.value[(i%beforeBrackets.value.length+beforeBrackets.value.length)%beforeBrackets.value.length])
				}
			}
			return bracketed
		}
		return genPool[str]
	}
	mainPool["get"]={"type":"func","value":function(args){for(var i in args)args[i]= ("Array"== typeof args[i])?mainPool["get"].value(args[i]):strTo(args[i],[mainPool]).value;return args}}
	mainPool["log"]={"type":"func","value":function(args){output.value+=mainPool["get"].value(args).join(" ")}}
	mainPool["ln"]={"type":"func","value":function(args){output.value+="\n"}}
	mainPool["logln"]={"type":"func","value":function(args){mainPool["log"].value(args);mainPool["ln"].value()}}
	var lines=code.value.split("\n")
	for(var i in lines)
		switch(lines[i].split(" ")[0])
		{
			case "=":
				mainPool[lines[i].split(" ")[1]]=lines[i].split(" ")[2]?{"type":lines[i].split(" ")[2],"value":strTo(lines[i].split(" ")[3],[mainPool]).value}:undefined
				break
			case "@":
				mainPool[lines[i].split(" ")[1]].value(lines[i].replace(/\S+ \S+ /,"").split(" "))
				break
		}
}