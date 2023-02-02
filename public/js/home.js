
const Auth = {
    logout:async function (){

        try {
            
            var data = await fetch(`${base_url}/logout`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    logout:true
                })
            });
    
            data = await data.json();
    
            window.location.href = `${base_url}/login`;

        } catch (error) {
            console.log(error);
        }

    }
}