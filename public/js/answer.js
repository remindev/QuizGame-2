const App = {

    animCount:true,

    /**
     * 
     * @param {Document} parent 
     */
    answerSubmit: async function (parent) {

        let input = parent.getElementsByTagName('input')[0];
        let answer = input.value.trim();
        let sucess = document.getElementById("play_sucess_anim");
        let err_disp = document.getElementById("err_disp");
        err_disp.style.display = 'none';

        try{
            var data = await fetch('/answerCheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    answer:answer,
                    question:Number(window.location.search.split("_")[1]),
                })
            });

            data = await data.json();

            if(data.message==false){
                err_disp.innerText = 'Nop, wrong answer';
                err_disp.style.display = 'initial';
                input.style.borderColor = 'rgb(225, 73, 73)';                
            }else{
                input.style.borderColor = 'green';
                sucess.style.display = 'flex';
            }

        } catch (err){
            console.log(err);
        }

    }

};
