const $ = require('jquery')
const defs = require('../definitions')
const common = require('../common')
const Datastore = require('nedb')
const Jimp = require('jimp')
const toBuffer = require('blob-to-buffer')
const fs = require('fs')
const path = require('path')
const _workdir = path.join(__dirname, '../../..')
console.log('internal path is: ' + _workdir)

let db = new Datastore({filename: _workdir + '/userdata/cores/internal/data.db', autoload: true})

class internal
{
    constructor()
    {
        this.page = 1
        this.last_id = 0
        this.tags = null
        this.loading = false
        this.firstload = false
        this.cache = {}
    }

    fetch_list(tags = null, page, callback = (posts) => {})
    {
        console.log('Fetching page ' + page)
        this.page = page
        var query
        var doTags = false

        if (tags)
        {
            this.tags = tags
            doTags = true
        }
        else
        {
            if (page > 1)
            {
                if (this.tags)
                {
                    tags = this.tags
                    doTags = true
                }
            }
            else
            {
                this.tags = null
            }
        }

        if (doTags)
        {
            tags = tags.split(' ')
            var andTags = []

            $.each(tags, (index, tag) =>
            {
                if (tag.charAt(0) != '-')
                {
                    andTags.push({
                        tags: tag
                    })
                }
                else
                {
                    andTags.push({
                        $not: {tags: tag.slice(1)}
                    })
                }
            })

            query = {
                $and: andTags
              }

            console.log(query)
        }
        else
        {
            query = {}
        }


        db.find(query).skip(20 * (page-1)).limit(20).exec((err, docs) =>
        {
            var posts = {}

            $.each(docs, (index, doc) =>
            {
                var thumb = new defs.thumb(doc.origin_id)
                thumb.sample_url = `http://localhost:3000${doc.sample_url}`
                thumb.sample_width = doc.sample_width
                thumb.sample_height = doc.sample_height
                thumb.format = doc.format
                thumb.tags = doc.tags
                thumb.core_origin = doc.core_origin

                posts[doc.origin_id] = thumb
            })

            callback(posts)
        })
    }

    fetch_post(id, callback = (post) => {})
    {
        
        db.find({origin_id: id}, (err, docs) =>
        {
            if (docs.length != 0)
            {
                var doc = docs[0]
                var post = new defs.post(doc.origin_id)
                post.file_url = `http://localhost:3000${doc.file_url}`
                post.file_height = doc.file_height
                post.file_width = doc.file_width
                post.format = doc.format
                post.tags = doc.tags
                post.core_origin = doc.core_origin

                console.log(doc)
                console.log(post)
                callback(post)
            }
            else
            {
                console.log('cannot find ' + `${corename}_${id}`)
            }
        })
        //var URL = `http://e621.net/post/show.json?username=${this.username}&password=${this.password}&id=${id}`
    }

    async save_post(post, dir, callback = (data) => {})
    {
        console.log(post)

        db.findOne({origin_id: `${post.core}_${post.id}`}, (err, doc) =>
        {
            if (doc == null)
            {
                var image = new Image()
                image.load(post.file_url, (img, e) =>
                {
                    //On Progress
                    console.log(img.completedPercentage)
                }, null, (img, e) =>
                {
                    console.log('Image finished')
                    //On Finish
                    toBuffer(img.blob, (err, buffer) =>
                    {
                        console.log('Image converted to buffer')
                        Jimp.read(buffer)
                        .then((image) =>
                        {
                            var data = {}
                            data.origin_id = `${post.core}_${post.id}`
                            data.core_origin = post.core
                            console.log('Image loaded into Jimp')
                            data.file_url = `/userdata/images/${post.core}/full/${data.origin_id}.jpg`
                            data.sample_url = `/userdata/images/${post.core}/sample/${data.origin_id}.jpg`
                            console.log(data.file_url)
                            console.log(data.sample_url)
                            
                            image.write(`${_workdir}${data.file_url}`)
                            data.file_height = image.bitmap.height
                            data.file_width = image.bitmap.width

                            image.scaleToFit(300, 300, Jimp.RESIZE_BEZIER)
                            image.write(`${_workdir}${data.sample_url}`)
                            data.sample_height = image.bitmap.height
                            data.sample_width = image.bitmap.width

                            if (typeof post.tags == 'string')
                            {
                                data.tags = post.tags.split(' ')
                            }
                            else
                            {
                                data.tags = post.tags
                            }

                            data.format = 'image'

                            console.log('Image processing finished without exception')

                            db.insert(data)
                            callback(data)
                        })
                    })
                    //db.insert()
                })
            }
        })
    }

    delete_post(id, callback = () => {})
    {
        db.findOne({origin_id: id}, (err, doc) => {
            if (doc != null)
            {
                try
                {
                    fs.unlinkSync(doc.file_url)
                    fs.unlinkSync(doc.sample_url)
                }
                catch(e)
                {
                    console.log(e)
                }
                db.remove({origin_id: id})
            }

            callback()
        })
    }
}

module.exports = new internal