var AssetManager = (function(){
    var AssetManager = function() {

        var scope = this;

        var collection = scope.collection = {};

        // dynamically defined types
        scope.types = {

        };

        scope.addItem = function(name, genFunc, count){
            name = name.toUpperCase();
            count = +count || 1;
            var index = scope.types[name];

            if(index === undefined){
               index = Object.keys(scope.types).length;
            }

            scope.types[name] = index;

            if(collection[index] == undefined){
                collection[index] = [];
            }
            for(var i = 0; i < count; i++){
                var obj = genFunc();
                obj.AM_index = index;
                scope.put(obj);
            }
        };

        scope.pull = function(index){
            if(index >= Object.keys(scope.types).length) return;
            return collection[index].pop();
        };

        scope.put = function(object){
            collection[object.AM_index].push(object);
        };
    };

    return AssetManager;
})();