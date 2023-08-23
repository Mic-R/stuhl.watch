async function login() {
  //get token cookie
    let token = document.cookie.split(";").find((c) => c.startsWith("token"));
    if (token) {
      window.location.href = "/vote/index.html";
    }
    else {
      window.location.href = "https://discord.com/api/oauth2/authorize?client_id=1133064675152629950&redirect_uri=https%3A%2F%2Fstuhl.watch%2Fvote%2Fauthenticate.html&response_type=code&scope=identify"
    }
}
