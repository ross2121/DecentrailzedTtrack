"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adduser = void 0;
const rooms = new Map();
const adduser = (Room, userid) => {
    rooms.set(userid, Room);
};
exports.adduser = adduser;
