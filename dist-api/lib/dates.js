"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalDateKey = getLocalDateKey;
exports.localDateKeyToUtc = localDateKeyToUtc;
exports.normalizeToLocalMidnight = normalizeToLocalMidnight;
exports.addCalendarDays = addCalendarDays;
exports.getCurrentWeekDateKeys = getCurrentWeekDateKeys;
exports.getLocalDayRange = getLocalDayRange;
const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";
const APP_UTC_OFFSET = "+07:00";
function getLocalDateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: APP_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}
function localDateKeyToUtc(dateKey) {
    return new Date(`${dateKey}T00:00:00${APP_UTC_OFFSET}`);
}
function normalizeToLocalMidnight(date) {
    return localDateKeyToUtc(getLocalDateKey(date));
}
function addCalendarDays(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
}
function getCurrentWeekDateKeys(now = new Date()) {
    const todayKey = getLocalDateKey(now);
    const calendarDate = new Date(`${todayKey}T00:00:00Z`);
    const daysSinceMonday = (calendarDate.getUTCDay() + 6) % 7;
    const mondayKey = addCalendarDays(todayKey, -daysSinceMonday);
    return Array.from({ length: 7 }, (_, index) => addCalendarDays(mondayKey, index));
}
function getLocalDayRange(now = new Date()) {
    const dateKey = getLocalDateKey(now);
    return {
        dateKey,
        start: localDateKeyToUtc(dateKey),
        end: localDateKeyToUtc(addCalendarDays(dateKey, 1)),
    };
}
