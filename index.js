const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const Schema = mongoose.Schema

;(function () {
  const app = express()

  // MongoDB
  console.log(`Connecting to MongoDB via ${process.env.MONGODB_URI}`)
  mongoose.connect(process.env.MONGODB_URI)

  const Queue = mongoose.model('Queue', {
    name: String,
    token: String,
    current: Schema.Types.ObjectId
  })

  const Participant = mongoose.model('Participant', {
    queueId: Schema.Types.ObjectId,
    done: Boolean
  })

  // Express body parse
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Create a queue
  app.post('/queue', (req, res) => {
    if (req.body.name) {
      Queue.create({
        name: req.body.name,
        token: req.body.token
      }, (err, queue) => {
        if (!err) {
          res.json({
            error: false,
            queue: queue._id,
            message: 'Queue successfully created'
          })
        } else {
          res.json({
            error: true,
            message: 'Failed to create queue'
          })
        }
      })
    } else {
      res.json({
        error: true,
        message: 'No name specified'
      })
    }
  })

  // Get current queue data
  app.get('/queue/:id', (req, res) => {
    Queue.findOne({ _id: req.params.id }, (err, queue) => {
      if (!err) {
        Participant.find({ queueId: req.params.id }, (err, participants) => {
          if (!err) {
            if (participants.filter(participant => !participant.done).length > 0) {
              res.json({
                error: false,
                _id: queue._id,
                current: queue.current,
                participants: participants
                  .filter(participant => !participant.done)
                  .map(participant => participant._id)
              })
            } else {
              res.json({
                error: true,
                message: 'No participants in queue'
              })
            }
          } else {
            res.json({
              error: true,
              message: 'No such queue'
            })
          }
        })
      } else {
        res.json({
          error: true,
          message: 'No such queue'
        })
      }
    })
  })

  // Update queue current number
  app.post('/queue/:id', (req, res) => {
    Queue.findOne({ _id: req.params.id }, (err, queue) => {
      if (!err && queue != null) {
        const updateCurrent = () => {
          // Find queue participants
          Participant.find({ queueId: req.params.id }, (err, participants) => {
            if (!err && participants.length > 0) {
              // Get first participant and set as current
              const current = participants
                .filter(participant => !participant.done)
                .map(participant => participant._id)[0]

              Queue.findOneAndUpdate({ _id: queue._id }, { current: current }, err => {
                queue.save(err => {
                  if (!err) {
                    res.json({
                      error: false,
                      _id: queue.id,
                      current: current
                    })
                  } else {
                    res.json({
                      error: true,
                      message: 'Error saving queue'
                    })
                  }
                })
              })
            } else {
              res.json({
                error: true,
                message: 'No participants available'
              })
            }
          })
        }

        // If queue has current user, set their status to done
        if (queue.current) {
          Participant.findOneAndUpdate({ _id: queue.current }, { done: true }, err => {
            if (err) {
              res.json({
                error: true,
                message: 'Error updating current participant'
              })
            } else {
              updateCurrent()
            }
          })
        } else {
          updateCurrent()
        }
      } else {
        res.json({
          error: true,
          message: 'No such queue'
        })
      }
    })
  })

  // Participate in a queue
  app.post('/queue/participate/:id', (req, res) => {
    Participant.create({ queueId: req.params.id, done: false }, (err, participant) => {
      if (!err) {
        res.json({
          error: false,
          _id: participant._id,
          queueId: participant.queueId
        })
      } else {
        res.json({
          error: true,
          message: 'Failed to create queue participation'
        })
      }
    })
  })

  // Serve application
  app.listen(process.env.PORT || 3000)
})()
