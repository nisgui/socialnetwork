var btnSignin = document.querySelector("#signin");
var btnSignup = document.querySelector("#signup");

var body = document.querySelector("body");


btnSignin.addEventListener("click", function () {
   body.className = "sign-in-js"; 
});

btnSignup.addEventListener("click", function () {
    body.className = "sign-up-js";
})


//<title>Validar Formulário com JavaScript</title>
//        <meta charset="utf-8">
//        <script type="text/javascript">
//            function validar(){
//                var Name = formuser.nome.value;
//                var email = formuser.email.value;
//                var password = formuser.senha.value;
//                
//                if(nome == ""){
//                    alert('Preencha o campo nome.');
//                    formuser.nome.focus();
//                    return false;
//                }
//                
//                if(email == "" || email.indexOf('@') == -1 ){
//                    alert('Preencha o campo E-mail.');
//                    formuser.email.focus();
//                    return false;
//                }
//                
//                if(senha == "" || senha.length <= 5){
//                    alert('Preencha o campo senha com minimo 6 caracteres');
//                    formuser.senha.focus();
//                    return false;
//                }
//            }
//        </script>