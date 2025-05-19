class blackjackEngine {

    constructor() {
        this.deck = this.#createShuffledDeck();
        this.playerHand = [];
        this.dealerHand = [];
    }

    #createShuffledDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }

        // Fisher-Yates to shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    drawCard() {
        return this.deck.pop();
    }

    dealInitialHands() {
        this.playerHand = [this.drawCard(), this.drawCard()];
        this.dealerHand = [this.drawCard(), this.drawCard()];
    }

    handToString(hand, hideSecond = false) {
        if (hideSecond) {
            return `${this.#formatCard(hand[0])} ?`;
        }
        return hand.map(c => this.#formatCard(c)).join(' ');
    }

    #formatCard(card) {
        return `\`${card.value}${card.suit}\``;
    }

    getHandValue(hand) {
        let total = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.value === 'A') {
                total += 11;
                aces++;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                total += 10;
            } else {
                total += parseInt(card.value);
            }
        }

        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    }
}

module.exports = blackjackEngine;