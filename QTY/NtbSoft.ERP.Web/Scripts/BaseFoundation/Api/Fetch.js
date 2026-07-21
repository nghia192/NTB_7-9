

class BaseFetchAPI {
    constructor(URL) {
        this.URL = URL;
        this.Payload = {};
        this.Method = "Get"
    }

    async post() {
        const res = await fetch(this.URL + "/" + this.Method, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ClientType: "web",
                ...this.Payload
            })
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        return res.json();
    }

    async get() {
        const query = new URLSearchParams({
            ClientType: "web",
            ...this.Payload
        });

        const res = await fetch(
            `${this.URL}?${query.toString()}`,
            {
                method: "GET"
            }
        );

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        return res.json();
    }

    buildPayload(payload = {}, method = "Get", action = "common") {
        if (!payload || typeof payload !== "object") return;
        this.Method = method;
        switch (action) {
            case "common":
                this.Payload = {
                    TableName: "",
                    ProcedureName: "",
                    Action: "",
                    TypeTable: [],
                    Parameter: "",
                    Parameter1: "",
                    Parameter2: "",
                    Parameter3: 0,
                    Parameter4: 0.0,
                    Parameter5: 0.0,
                    Parameter6: new Date(),
                    Parameter7: new Date(),
                };
                Object.assign(this.Payload, payload);
                break;
            case "dynamic":
                this.Payload = { ...payload };
                break;
        }
        
    }
}