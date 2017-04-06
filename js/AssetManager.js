var AssetManager = function() {

    var scope = this;

    var collection = scope.collection = {};

    // dynamically defined types
    scope.types = {

    };

    scope.addItem = function(name, genFunc, count, resetFunc){        
        name = name.toUpperCase();
        count = +count || 1;
        var index = scope.types[name];

        if(index === undefined){
           index = Object.keys(scope.types).length;
        }

        scope.types[name] = index;

        if(collection[index] == undefined){            
            collection[index] = 
            {   
                name: name,
                func : genFunc,
                array: [],
                resetFunc : resetFunc
            };
        }        

        for(var i = 0; i < count; i++){
            var obj = genFunc();
            obj.AM_index = index;            
            scope.put(obj);
        }
    };

    scope.pull = function(index){      
        if(index >= Object.keys(scope.types).length) return;

        if(collection[index].array.length < 1){            
            scope.addItem(collection[index].name, collection[index].func);
        }

        return collection[index].array.pop();

    };

    scope.put = function(object){
        if(collection[object.AM_index].resetFunc){
         collection[object.AM_index].resetFunc.call(object);         
        }
        collection[object.AM_index].array.push(object);
    };
};    
