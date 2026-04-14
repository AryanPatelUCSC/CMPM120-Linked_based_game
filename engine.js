class Engine {
    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        // INSTEAD of creating elements, grab the ones we made in index.html
        this.header = document.getElementById("game-title");
        this.output = document.getElementById("story-text-container");
        this.actionsContainer = document.getElementById("choices-container");
        this.inventoryOutput = document.getElementById("inventory-list");

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass);
            }
        );
    }

    gotoScene(sceneClass, data) {
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = `> ${action}`;
        button.onclick = () => {
            while (this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild);
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = `[SYS] ${title}`;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg + "<br><br>";
        this.output.appendChild(div);

        // setTimeout gives the browser a millisecond to draw the text 
        // before calculating the exact bottom of the scroll container.
        setTimeout(() => {
            this.output.scrollTop = this.output.scrollHeight;

            // Alternatively, for a smooth scrolling effect, you can use:
            // div.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 10);
    }

    // New method to visually update the inventory box
    updateInventory(inventoryArray, itemDataDb) {
        while (this.inventoryOutput.firstChild) {
            this.inventoryOutput.removeChild(this.inventoryOutput.firstChild);
        }

        if (inventoryArray.length === 0) {
            this.inventoryOutput.innerHTML = "<p style='color:#555;'>No bio-matter acquired.</p>";
            return;
        }

        inventoryArray.forEach(itemId => {
            let itemInfo = itemDataDb[itemId];
            if (itemInfo) {
                let itemDiv = document.createElement("div");
                itemDiv.style.marginBottom = "10px";
                itemDiv.innerHTML = `<strong style="color:#00FFCC;">[+] ${itemInfo.Name}</strong><br><span style="color:#aaa; font-size:0.9em;">${itemInfo.Desc}</span>`;
                this.inventoryOutput.appendChild(itemDiv);
            }
        });
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }
    create() { }
    update() { }
    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}