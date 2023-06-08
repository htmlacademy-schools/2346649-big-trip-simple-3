import dayjs from 'dayjs';
import {FILTER_TYPE} from './consts';

const EVENT_DATE_FORMAT = 'MMM D';
const TIME_FORMAT = 'H:mm';
const BASIC_DATE_FORMAT = 'DD/MM/YY HH:mm';

export const convertToEventDateTime = (date) => date.substring(0, date.indexOf('T'));
export const convertToEventDate = (date) => dayjs(date).format(EVENT_DATE_FORMAT);
export const convertToDateTime = (date) => date.substring(0, date.indexOf(':'));
export const convertToTime = (date) => dayjs(date).format(TIME_FORMAT);
export const convertToUpperCase = (type) => type.charAt(0).toUpperCase() + type.slice(1);
export const convertToBasicTime = (date) => dayjs(date).format(BASIC_DATE_FORMAT);
export const datesAreEqual = (dateA, dateB) => (!dateA && !dateB) || dayjs(dateA).isSame(dateB, 'D');
export const getItemFromItemsById = (items, id) => (items.find((item) => item.id === id));

const dateInFuture = (dateFrom, dateTo) => dateFrom && dateTo && (dayjs().isBefore(dateFrom, 'D') || dayjs().isBefore(dateTo, 'D'));
const dateInPast = (dateTo) => dateTo && dayjs().isAfter(dateTo, 'D');

export const filter = {
  [FILTER_TYPE.FUTURE]: (tripPoints) => tripPoints.filter((tripPoint) => dateInFuture(tripPoint.dateFrom, tripPoint.dateTo)),
  [FILTER_TYPE.EVERYTHING]: (tripPoints) => tripPoints,
  [FILTER_TYPE.PAST]: (tripPoints) => tripPoints.filter((tripPoint) => dateInPast(tripPoint.dateTo)),
};
