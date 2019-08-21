class loader
{
    constructor()
    {
        this.corelist = {}
        this.current = ''
    }

    add_core(str)
    {
        this.corelist[str] = require('./Cores/' + str)
    }

    get_core(str)
    {
        return this.corelist[str]
    }

    get_list()
    {
        return this.corelist
    }

    fetch_list(tags, page, callback = (posts) => {})
    {
        if (this.current != '')
        {
            this.corelist[this.current].fetch_list(tags, page, callback)
        }
    }
}

module.exports = new loader