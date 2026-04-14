class Engine {
    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        // Build the HUD Layout
        this.container = document.body.appendChild(document.createElement("div"));
        this.container.id = "game-container";

        // Left Panel: Story & Actions
        this.mainPanel = this.container.appendChild(document.createElement("div"));
        this.mainPanel.className = "panel";
        this.header = this.mainPanel.appendChild(document.createElement("h1"));
        this.output = this.mainPanel.appendChild(document.createElement("div"));
        this.output.id = "story-output";
        this.actionsContainer = this.mainPanel.appendChild(document.createElement("div"));
        this.actionsContainer.id = "actions-container";

        // Right Panel: Inventory & Stats
        this.sidePanel = this.container.appendChild(document.createElement("div"));
        this.sidePanel.className = "panel";
        let invHeader = this.sidePanel.appendChild(document.createElement("h1"));
        invHeader.innerText = "// INVENTORY_DATA";
        this.inventoryOutput = this.sidePanel.appendChild(document.createElement("div"));

        fetch(storyDataUrl)
            .then((response) => response.json())
            .then((json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass);
            });
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
        };
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = `[SYS] ${title}`;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg + "<br><br>";
        this.output.appendChild(div);
        // Auto-scroll to bottom like a real terminal
        this.output.scrollTop = this.output.scrollHeight;
    }

    updateInventory(inventoryArray, itemDataDb) {
        // Clear current inventory UI
        while (this.inventoryOutput.firstChild) {
            this.inventoryOutput.removeChild(this.inventoryOutput.firstChild);
        }

        if (inventoryArray.length === 0) {
            this.inventoryOutput.innerHTML = "<p style='color:#555;'>No bio-matter or tech acquired.</p>";
            return;
        }

        // Render each item visually
        inventoryArray.forEach(itemId => {
            let itemInfo = itemDataDb[itemId];
            if (itemInfo) {
                let itemDiv = document.createElement("div");
                itemDiv.className = "inventory-item";
                itemDiv.innerHTML = `<strong>[+] ${itemInfo.Name}</strong>${itemInfo.Desc}`;
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