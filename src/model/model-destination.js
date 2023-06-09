import Observable from '../framework/observable';

export default class ModelDestinations extends Observable {
  #tripPointApiServer;
  #destinations = [];

  constructor({tripEventApiService}) {
    super();
    this.#tripPointApiServer = tripEventApiService;
    this.init();
  }

  init = async () => {
    try {
      this.#destinations = await this.#tripPointApiServer .destinations;
    } catch (err) {
      this.#destinations = [];
    }
  };

  get destinations() {
    return this.#destinations;
  }
}
