import { uuidv7 } from "uuidv7";

type AbstractionEntityDTO = {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

export abstract class AbstractEntity<ToJSON> {
    #id: string
    #createdAt: Date
    #updatedAt: Date

    constructor({
        id = uuidv7(),
        createdAt = new Date(),
        updatedAt = new Date(),
    }: AbstractionEntityDTO){
        this.#id = id
        this.#createdAt = createdAt
        this.#updatedAt = updatedAt
    }

    get id(): string {
        return this.#id
    }

    get createdAt(): Date {
        return this.#createdAt
    }

    get updatedAt(): Date {
        return this.#updatedAt
    }

    set updatedAt(value: Date) {
        this.#updatedAt = value
    }

    protected updateEntity(): void {
        this.updatedAt = new Date()
    }

    abstract toJSON(): ToJSON;
}