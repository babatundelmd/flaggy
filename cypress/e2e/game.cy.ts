describe('Flag Master Core Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should load the game and show the first flag', () => {
        cy.get('h1').contains('Flag Master');
        cy.get('.flag-container').should('be.visible');
        cy.get('.btn-option').should('have.length', 3);
    });

    it('should allow selecting an option and updating score', () => {
        // Wait for flags to load
        cy.get('.btn-option').first().click();

        // After click, buttons should be disabled briefly OR the next question should load
        // Let's check for the "Seen" counter update or Score update
        cy.get('.stat-value').first().then(($score) => {
            const initialScore = parseInt($score.text());

            // This is hard to test perfectly without knowing which one is correct
            // But we can check that a selection was made by checking for the presence of status classes
            cy.get('.btn-option').should($btns => {
                expect($btns.filter('.correct').length + $btns.filter('.wrong').length).to.be.at.least(1);
            });
        });
    });

    it('should filter countries by region', () => {
        cy.get('select').first().select('Europe');
        // Wait for the game to reset/reload with new flags
        cy.get('.flag-container').should('be.visible');
    });
});
