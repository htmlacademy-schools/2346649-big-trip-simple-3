import Observable from '../framework/observable';

export default class ModelOffer extends Observable{
  #tripPointApiServer;
  #offers = [];

  constructor (tripPointApiServer) {
    super();
    this.#tripPointApiServer = tripPointApiServer;
    this.init();
  }

  init = async () => {
    try {
      this.#offers = await this.#tripPointApiServer.offers;
    } catch(err) {
      this.#offers = [];
    }
  };

  get offers() {
    return this.#offers;
  }
}
