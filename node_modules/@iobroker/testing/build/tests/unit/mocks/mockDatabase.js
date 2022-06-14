"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsserts = exports.MockDatabase = void 0;
const objects_1 = require("alcalzone-shared/objects");
const typeguards_1 = require("alcalzone-shared/typeguards");
const str2regex_1 = require("../../../lib/str2regex");
const objectTemplate = Object.freeze({
    type: "state",
    common: { name: "an object" },
    native: {},
});
const stateTemplate = Object.freeze({
    ack: false,
    val: 0,
});
/**
 * A minimalistic version of ioBroker's Objects and States DB that just operates on a Map
 */
class MockDatabase {
    constructor() {
        this.objects = new Map();
        this.states = new Map();
    }
    clearObjects() {
        this.objects.clear();
    }
    clearStates() {
        this.states.clear();
    }
    clear() {
        this.clearObjects();
        this.clearStates();
    }
    publishObject(obj) {
        if (obj._id == null)
            throw new Error("An object must have an ID");
        if (obj.type == null)
            throw new Error("An object must have a type");
        const completeObject = (0, objects_1.extend)({}, objectTemplate, obj);
        this.objects.set(obj._id, completeObject);
    }
    publishObjects(...objects) {
        objects.forEach(this.publishObject.bind(this));
    }
    publishStateObjects(...objects) {
        objects
            .map((obj) => (0, objects_1.extend)({}, obj, { type: "state" }))
            .forEach(this.publishObject.bind(this));
    }
    publishChannelObjects(...objects) {
        objects
            .map((obj) => (0, objects_1.extend)({}, obj, { type: "channel" }))
            .forEach(this.publishObject.bind(this));
    }
    publishDeviceObjects(...objects) {
        objects
            .map((obj) => (0, objects_1.extend)({}, obj, { type: "device" }))
            .forEach(this.publishObject.bind(this));
    }
    deleteObject(objOrID) {
        this.objects.delete(typeof objOrID === "string" ? objOrID : objOrID._id);
    }
    publishState(id, state) {
        // if (typeof id !== "string") throw new Error("The id must be given!");
        if (state == null) {
            this.deleteState(id);
            return;
        }
        const completeState = (0, objects_1.extend)({}, stateTemplate, state);
        this.states.set(id, completeState);
    }
    deleteState(id) {
        this.states.delete(id);
    }
    publishStates(states) {
        for (const id of Object.keys(states)) {
            this.publishState(id, states[id]);
        }
    }
    hasObject(namespaceOrId, id) {
        id = namespaceOrId + (id ? "." + id : "");
        return this.objects.has(id);
    }
    getObject(namespaceOrId, id) {
        // combines getObject and getForeignObject into one
        id = namespaceOrId + (id ? "." + id : "");
        return this.objects.get(id);
    }
    hasState(namespaceOrId, id) {
        id = namespaceOrId + (id ? "." + id : "");
        return this.states.has(id);
    }
    getState(namespaceOrId, id) {
        // combines getObject and getForeignObject into one
        id = namespaceOrId + (id ? "." + id : "");
        return this.states.get(id);
    }
    getObjects(namespaceOrPattern, patternOrType, type) {
        // combines getObjects and getForeignObjects into one
        let pattern;
        if (type != null) {
            pattern =
                namespaceOrPattern + (patternOrType ? "." + patternOrType : "");
        }
        else if (patternOrType != null) {
            if (["state", "channel", "device"].indexOf(patternOrType) > -1) {
                type = patternOrType;
                pattern = namespaceOrPattern;
            }
            else {
                pattern = namespaceOrPattern + "." + patternOrType;
            }
        }
        else {
            pattern = namespaceOrPattern;
        }
        const idRegExp = (0, str2regex_1.str2regex)(pattern);
        return (0, objects_1.composeObject)([...this.objects.entries()]
            .filter(([id]) => idRegExp.test(id))
            .filter(([, obj]) => type == null || obj.type === type));
    }
    getStates(pattern) {
        // combines getStates and getForeignStates into one
        const idRegExp = (0, str2regex_1.str2regex)(pattern);
        return (0, objects_1.composeObject)([...this.states.entries()].filter(([id]) => idRegExp.test(id)));
    }
}
exports.MockDatabase = MockDatabase;
/**
 * Returns a collection of predefined assertions to be used in unit tests
 * Those include assertions for:
 * * State exists
 * * State has a certain value, ack flag, object property
 * * Object exists
 * * Object has a certain common or native part
 * @param db The mock database to operate on
 * @param adapter The mock adapter to operate on
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createAsserts(db, adapter) {
    function normalizeID(id) {
        if ((0, typeguards_1.isArray)(id))
            id = id.join(".");
        // Test if this ID is fully qualified
        if (!/^[a-z0-9\-_]+\.\d+\./.test(id)) {
            id = adapter.namespace + "." + id;
        }
        return id;
    }
    const ret = {
        assertObjectExists(id) {
            id = normalizeID(id);
            db.hasObject(id).should.equal(true, `The object "${adapter.namespace}.${id}" does not exist but it was expected to!`);
        },
        assertStateExists(id) {
            id = normalizeID(id);
            db.hasState(id).should.equal(true, `The state "${adapter.namespace}.${id}" does not exist but it was expected to!`);
        },
        assertStateHasValue(id, value) {
            ret.assertStateProperty(id, "val", value);
        },
        assertStateIsAcked(id, ack = true) {
            ret.assertStateProperty(id, "ack", ack);
        },
        assertStateProperty(id, property, value) {
            id = normalizeID(id);
            ret.assertStateExists(id);
            db.getState(id)
                .should.be.an("object")
                .that.has.property(property, value);
        },
        assertObjectCommon(id, common) {
            id = normalizeID(id);
            ret.assertObjectExists(id);
            const dbObj = db.getObject(id);
            dbObj.should.be.an("object").that.has.property("common");
            dbObj.common.should.be.an("object").that.nested.include(common);
        },
        assertObjectNative(id, native) {
            id = normalizeID(id);
            ret.assertObjectExists(id);
            const dbObj = db.getObject(id);
            dbObj.should.be.an("object").that.has.property("native");
            dbObj.native.should.be.an("object").that.nested.include(native);
        },
    };
    return ret;
}
exports.createAsserts = createAsserts;
