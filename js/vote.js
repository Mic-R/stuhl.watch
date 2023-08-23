let GUser;

async function isLoggedIn() {
    try {
    const {data: user} = await axios.get("https://backend.stuhl.watch/auth/me", {
        headers: {
            Authorization: "Bearer " + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]
        }
    });
    GUser = user.userDataIfExists;

    const userName = document.getElementById("userName");
    //clear cookies
    userName.innerHTML = `Eingeloggt als ${user.userDataIfExists?.name} (<a style="text-decoration: underline; color: gray; cursor: pointer" onclick="document.cookie = ''; window.location.href = '/';">Ausloggen</a>)`;
    } catch (e) {
        window.location.href = "/";
    }
}

let memes;

async function getMemes() {
    try {
        //connect to memes database and get all votes with live updates
        let {data: memeDat} = await axios.get("https://backend.stuhl.watch/meme/list", {
            headers: {
                Authorization: "Bearer " + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]
            }
        });
        console.log(memeDat)
        memes = memeDat;
        return memeDat;
    } catch (e) {
        alert("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.")
    }
}

let votes;

async function getVotes() {
    try {
        let {data: voteDat} = await axios.get("https://backend.stuhl.watch/vote/me", {
            headers: {
                Authorization: "Bearer " + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]
            }
        });
        votes = voteDat;

        for (const vote of voteDat) {
            if (vote.direction) {
                let upvoteButton = await document.getElementById(`upvote-${vote.memeId}`);
                upvoteButton.style.backgroundColor = "#77dd77";
                upvoteButton.style.color = "white";
            } else {
                let downvoteButton = await document.getElementById(`downvote-${vote.memeId}`);
                downvoteButton.style.backgroundColor = "#FF6961";
                downvoteButton.style.color = "white";
            }
        }
    } catch (e) {
        alert("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.")
    }
}


async function vote(id, vote) {
    try {
    let votecount = document.getElementById(`votecount-${id}`);
    //add record to votes table
    await getVotes();
    if (!votes.find((v) => v.memeId === id && v.direction === vote)) {
        const {data} = await axios.post(`https://backend.stuhl.watch/vote/insert`, {
            memeId: id,
            direction: vote
        }, {
            headers: {
                Authorization: "Bearer " + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]
            }
        });

        if (vote) {
            let upvoteButton = document.getElementById(`upvote-${id}`);
            upvoteButton.style.backgroundColor = "#77dd77";
            upvoteButton.style.color = "white";
        } else {
            let downvoteButton = document.getElementById(`downvote-${id}`);
            downvoteButton.style.backgroundColor = "#FF6961";
            downvoteButton.style.color = "white";
        }

        //update vote count by adding or subtracting 1 from current innerText
        if (vote) {
            votecount.innerHTML = `<p>${parseInt(votecount.innerText) + 1}</p>`;
        }
        if (!vote) {
            votecount.innerHTML = `<p>${parseInt(votecount.innerText) - 1}</p>`;
        }
    } else {
        const {data} = axios.post(`https://backend.stuhl.watch/vote/delete`, {
            memeId: id,
            direction: vote
        }, {
            headers: {
                Authorization: "Bearer " + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]
            }
        });

        if (vote) {
            let upvoteButton = document.getElementById(`upvote-${id}`);
            upvoteButton.style.backgroundColor = "white";
            upvoteButton.style.color = "black";
        } else {
            let downvoteButton = document.getElementById(`downvote-${id}`);
            downvoteButton.style.backgroundColor = "white";
            downvoteButton.style.color = "black";
        }

        //update vote count by adding or subtracting 1 from current innerText
        if (!vote) {
            votecount.innerHTML = `<p>${parseInt(votecount.innerText) + 1}</p>`;
        }
        if (vote) {
            votecount.innerHTML = `<p>${parseInt(votecount.innerText) - 1}</p>`;
        }
    }
    } catch (e) {
        alert("Verbindung zum Server konnte nicht hergestellt werden");
    }
}


async function renderVotes() {
    try {
        getMemes().then((memeDat) => {
            const memeContainer = document.getElementById("memeContainer");
            memeContainer.innerHTML = "";
            for (let i = 0; i < memeDat.length; i++) {
                const meme = memeDat[i];
                memeContainer.innerHTML += `
            <div class="meme">
                <img class="memeIMG" src="${meme.url}" alt="meme">
                <div class="voteContainer">
                    <button style=""  class="voteButton" id="upvote-${meme.id}" onclick="vote(${meme.id}, true)">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <div class="votecount" id="votecount-${meme.id}">
                        <p>${meme.upvotes - meme.downvotes}</p>
                    </div>
                    <button style="" class="voteButton" id="downvote-${meme.id}" onclick="vote(${meme.id}, false)">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </div>
            `;
            }

            getVotes();
        });
    } catch (e) {
        alert("Verbindung zum Server konnte nicht hergestellt werden");
    }
}

async function joinRealtime() {
    try {
        const Memes = new WebSocket('wss://backend.stuhl.watch/votews/ws?authorization=' + document.cookie.split(";").find((c) => c.startsWith("token")).split("=")[1]);

        Memes.onmessage = function (event) {
            const newMeme = JSON.parse(event.data);
            const oldMeme = memes.find((meme) => meme.id === newMeme.id);
            if (oldMeme) {
                memes[memes.indexOf(oldMeme)] = newMeme;

                const voteCount = document.querySelector(`#votecount-${newMeme.id}`);
                voteCount.innerHTML = `${newMeme.upvotes - newMeme.downvotes}`;
            }
        }

        Memes.onclose = function (event) {
            alert("Verbindung zum Server wurde unterbrochen. Seite wird neu geladen.");
            location.reload();
        }
    } catch (e) {
        alert("Verbindung zum Server konnte nicht hergestellt werden.")
    }
}
