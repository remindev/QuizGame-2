import * as DBS from './schemas.js'; // improting skemas

export default function (){
    async function getGameLevels(){

        let gdb = await DBS.levels.find({});

        db = gdb;

        for(let i=0; i<db.length-1; i++){

            for(let j=0; j<db.length-1; j++){
        
                if(Number(db[j].level) > Number(db[j+1].level)){
                    
                    let temp = db[j];
                    db[j] = db[j+1];
                    db[j+1] = temp;
        
                }
        
            }
        
        }
    
        return db;

    }

    return getGameLevels()

}


