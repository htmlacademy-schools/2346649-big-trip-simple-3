import {UPDATE_TYPE} from '../utils/consts';
import Observable from '../framework/observable';
export default class TripPointModel extends Observable {
  #tripPointApiServer;
  #tripPoints = [];

  constructor (tripPointApiServer) {
    super();
    this.#tripPointApiServer = tripPointApiServer;

  }

  get tripPoints() {
    return this.#tripPoints;
  }

  init = async () => {
    try {
      const tripPoints = await this.#tripPointApiServer.tripPoints;
      this.#tripPoints = tripPoints.map(this.#adaptToClient);
    } catch(err) {
      this.#tripPoints = [];
    }

    this._notify(UPDATE_TYPE.INIT);
  };

  updateTripPoint = async (updateType, update) => {
    const index = this.#tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existent tripPoint');
    }


    try {
      const response = await this.#tripPointApiServer.updateTripPoint(update);
      const updatedTripPoint = this.#adaptToClient(response);
      this.#tripPoints = [
        ...this.tripPoints.slice(0, index),
        updatedTripPoint,
        ...this.#tripPoints.slice(index + 1),
      ];

      this._notify(updateType, updatedTripPoint);
    } catch(err) {
      throw new Error('Can\'t update tripPoint');
    }
  };

  addTripPoint = async (updateType, update) => {
    try {
      const response = await this.#tripPointApiServer.addTripPoint(update);
      const newTripPoint = this.#adaptToClient(response);
      this.#tripPoints = [newTripPoint, ...this.#tripPoints];
      this._notify(updateType, newTripPoint);
    } catch(err) {
      throw new Error('Can\'t add tripPoint');
    }
  };

  deleteTripPoint = async (updateType, update) => {
    const index = this.#tripPoints.findIndex((tripPoint) => tripPoint.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete non-existent tripPoint');
    }
    try {
      await this.#tripPointApiServer.deleteTripPoint(update);
      this.#tripPoints = [
        ...this.tripPoints.slice(0, index),
        ...this.#tripPoints.slice(index + 1),
      ];
      this._notify(updateType);
    } catch(err) {
      throw new Error('Can\'t delete tripPoint');
    }
  };

  #adaptToClient = (tripPoint) => {
    const adaptedTripPoint = {...tripPoint,
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
