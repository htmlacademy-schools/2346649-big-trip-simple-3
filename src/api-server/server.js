import ApiService from '../framework/api-service';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

export default class ApiServer extends ApiService {
  get tripPoints() {
    return this._load({url: 'points'})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({url: 'destinations'})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: 'offers'})
      .then(ApiService.parseResponse);
  }

  async updateTripPoint(tripPoint) {
    const response = await this._load({
      url: `points/${tripPoint.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(tripPoint)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return await ApiService.parseResponse(response);
  }

  async addTripPoint(tripPoint) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(tripPoint)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return await ApiService.parseResponse(response);
  }

  async deleteTripPoint(tripPoint) {
    return await this._load({
      url: `points/${tripPoint.id}`,
      method: Method.DELETE,
    });
  }

  #adaptToServer(tripPoint) {
    const adaptedTripPoint = {...tripPoint,
      'date_from': (tripPoint.dateFrom) ? new Date(tripPoint.dateFrom).toISOString() : new Date().toISOString,
      'date_to': (tripPoint.dateFrom) ? new Date(tripPoint.dateTo).toISOString() : new Date().toISOString,
      'base_price': Number(tripPoint.basePrice),
      'offers': tripPoint.offersIDs
    };

    delete adaptedTripPoint.dateFrom;
    delete adaptedTripPoint.dateTo;
    delete adaptedTripPoint.basePrice;
    delete adaptedTripPoint.offersIDs;
    return adaptedTripPoint;
  }
}
