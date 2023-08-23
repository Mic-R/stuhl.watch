function main() {
    //get the code query parameter
    let code = window.location.search.split("=")[1];
    if (code) {
        //get the token
        fetch(`https://backend.stuhl.watch/auth/discord?code=${code}`).then(
            (response) => {
                if (response.ok) {
                    //set token cookie
                    response.json().then((data) => {
                        document.cookie = `token=${data.token}`;
                    });
                    //redirect to vote page
                    window.location.href = "/vote/index.html";
                } else {
                    //display error
                    alert("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
                }
            }
        )
    }
}
