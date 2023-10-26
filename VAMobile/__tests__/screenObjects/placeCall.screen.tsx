import AppScreen from './app.screen';

const SELECTORS = {
    PLACE_CALL_SCREEN: '~place-call-page',
};

class PlaceCallScreen extends AppScreen {
    constructor() {
        super(SELECTORS.PLACE_CALL_SCREEN)
    }
}

export default new PlaceCallScreen()
