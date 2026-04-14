// --- GLOBAL STATE ---
let gameState = {
    inventory: [],
    savePoint: null
};

// Helper: Refresh the visual inventory
function syncInventory(engine) {
    engine.updateInventory(gameState.inventory, engine.storyData.Items);
}

class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        // Clear output on start to keep it clean
        this.engine.output.innerHTML = "";
        this.engine.show("<span style='color:var(--accent-cyan)'>[SYSTEM] Neural Handshake Initialized.</span>");
        this.engine.addChoice("Deploy Shell");
        syncInventory(this.engine);
    }
    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];

        // Clear previous text for terminal feel, or just print divider
        this.engine.show(`<span style='color:#555;'>-----------------------------------</span>`);
        this.engine.show(`<b>[LOCATION]: ${key}</b><br>${locationData.Body}`);

        // --- ITEM SYSTEM ---
        if (locationData.Loot) {
            let item = locationData.Loot;
            if (!gameState.inventory.includes(item)) {
                gameState.inventory.push(item);
                let itemName = this.engine.storyData.Items[item].Name;
                this.engine.show(`<span style="color: var(--accent-lime);"><i>[+] Harvested: ${itemName}</i></span>`);
                syncInventory(this.engine);
            }
        }

        // --- CHOICES & LOCKS ---
        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {

                // [Lock & Key] Standard visible lock
                if (choice.Requires && !gameState.inventory.includes(choice.Requires)) {
                    continue;
                }

                // [Get Lamp] Hidden path mechanic
                if (choice.RequiresHidden && !gameState.inventory.includes(choice.RequiresHidden)) {
                    continue;
                }

                this.engine.addChoice(choice.Text, choice);
            }
        }
    }

    handleChoice(choice) {
        if (!choice) return this.engine.gotoScene(End);

        this.engine.show(`<span style="color:var(--accent-cyan)">&gt; ${choice.Text}</span>`);

        if (choice.Target === "NeuralSeverance") {
            this.engine.gotoScene(DeathScene, choice.Target);
        } else {
            let nextLoc = this.engine.storyData.Locations[choice.Target];

            // Route to custom subclasses based on JSON data
            if (nextLoc.IsSplicingStation) {
                this.engine.gotoScene(SplicingStationLocation, choice.Target);
            } else if (choice.Target === "EndState") {
                this.engine.gotoScene(End, choice.Target);
            } else {
                this.engine.gotoScene(Location, choice.Target);
            }
        }
    }
}

// --- MULTI-STEP "BABELFISH" PUZZLE & SAVE POINT ---
class SplicingStationLocation extends Location {
    create(key) {
        super.create(key); // Draw room normally

        // Save Point Mechanic
        this.engine.addChoice("[INTERACT: Inject consciousness into Mycelial Node]", { action: "save", target: key });

        // Crafting Mechanic (Requires Biomass AND Energy Cell to create Lungs)
        let hasBiomass = gameState.inventory.includes("biomass");
        let hasCell = gameState.inventory.includes("energy_cell");
        let hasLungs = gameState.inventory.includes("lungs");

        if (hasBiomass && hasCell && !hasLungs) {
            this.engine.show(`<span style='color:var(--accent-lime)'><i>[!] The Stasis Pod detects your raw materials. Splicing is available.</i></span>`);
            this.engine.addChoice("[CRAFT] Splice Filtration Lungs (Consumes Biomass & Energy Cell)", { action: "craft", target: key });
        }
    }

    handleChoice(choice) {
        if (choice && choice.action === "save") {
            gameState.savePoint = choice.target;
            this.engine.show(`<span style="color: var(--accent-lime);">&gt; <i>Neural Spore Backup Established.</i></span>`);
            this.engine.gotoScene(SplicingStationLocation, choice.target); // Reload room
        } else if (choice && choice.action === "craft") {
            // Consume items
            gameState.inventory = gameState.inventory.filter(i => i !== "biomass" && i !== "energy_cell");
            // Add crafted item
            gameState.inventory.push("lungs");
            this.engine.show(`<span style="color: var(--accent-lime);">&gt; <i>Splicing complete. You can now breathe in toxic environments.</i></span>`);
            syncInventory(this.engine);
            this.engine.gotoScene(SplicingStationLocation, choice.target); // Reload room
        } else {
            super.handleChoice(choice);
        }
    }
}

// --- PERMADEATH LOGIC ---
class DeathScene extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(`<br><span style="color: var(--danger-red);"><b>[FATAL ERROR] ${locationData.Body}</b></span>`);

        // Empty inventory on death
        gameState.inventory = [];
        syncInventory(this.engine);

        if (gameState.savePoint) {
            this.engine.addChoice("Regrow from Mycelial Pod (Load Save)", { Target: gameState.savePoint });
        } else {
            this.engine.addChoice("Wake up in Surface Vat (Restart)", { Target: this.engine.storyData.InitialLocation });
        }
    }

    handleChoice(choice) {
        let nextLoc = this.engine.storyData.Locations[choice.Target];
        if (nextLoc && nextLoc.IsSplicingStation) {
            this.engine.gotoScene(SplicingStationLocation, choice.Target);
        } else {
            this.engine.gotoScene(Location, choice.Target);
        }
    }
}

class End extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(`<br><span style="color: var(--accent-cyan);"><b>${locationData.Body}</b></span>`);
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');