
const Auth = {
    logout:async function (){

        try {
            
            var data = await fetch('/logout',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    logout:true
                })
            });
    
            data = await data.json();
    
            window.location.href = '/login';

        } catch (error) {
            console.log(error);
        }

    }
}