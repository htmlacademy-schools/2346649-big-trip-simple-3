
import Observable from '../framework/observable';
import {UPDATE_TYPE} from '../utils/consts';

export default class TripPointModel extends Observable {

  #tripPoint = [];
  #tripPointApiServer;

  constructor({tripEventApiService}) {
    super();
    this.#tripPointApiServer = tripEventApiService;
  }

  get tripEvents() {
    return this.#tripPoint;
  }

  init = async () => {
    try {
      const tripEvents = await this.#tripPointApiServer.tripEvents;
      this.#tripPoint = tripEvents.map(this.#adaptToClient);
    } catch (error) {
      this.#tripPoint = [];
    }
    this._notify(UPDATE_TYPE.INIT);
  };

  updateTripPoint = async (updateType, update) => {
    const index = this.#tripPoint.findIndex((event) => event.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting tripPoint');
    }

    try {
      const response = await this.#tripPointApiServer.updateTripEvent(update);
      const updatedTripEvents = this.#adaptToClient(response);
      this.#tripPoint = [
        ...this.tripEvents.slice(0, index),
        updatedTripEvents,
        ...this.#tripPoint.slice(index + 1),
      ];

      this._notify(updateType, updatedTripEvents);
    } catch (err) {
      throw new Error('Can\'t update tripPoint');
    }
  };

  addTripPoint = async (updateType, update) => {
    try {
      const response = await this.#tripPointApiServer.addTripEvent(update);
      const newTripPoint = this.#adaptToClient(response);
      this.#tripPoint = [newTripPoint, ...this.#tripPoint];
      this._notify(updateType, newTripPoint);
    } catch (err) {
      throw new Error('Can\'t add tripPoint');
    }
  };

  deleteTripPoint = async (updateType, update) => {
    const index = this.#tripPoint.findIndex((tripPoint) => tripPoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete not existing tripPoint');
    }

    try {
      await this.#tripPointApiServer.deleteTripEvent(update);
      this.#tripPoint = [
        ...this.tripEvents.slice(0, index),
        ...this.#tripPoint.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete tripPoint');
    }
  };

  #adaptToClient = (tripPoint) => {
    const adaptedTripPoint = {
      ...tripPoint,
      dateFrom: tripPoint['date_from'],
      dateTo: tripPoint['date_to'],
      offersIDs: tripPoint['offers'],
      basePrice: tripPoint['base_price'],
    };

    delete adaptedTripPoint['date_from'];
    delete adaptedTripPoint['date_to'];
    delete adaptedTripPoint['base_price'];
    delete adaptedTripPoint['offers'];

    return adaptedTripPoint;
  };
}
