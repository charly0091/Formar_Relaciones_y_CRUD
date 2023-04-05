const {validationResult} = require('express-validator');
const {Movie , Sequelize, Genre} = require('../database/models');
const {Op} = Sequelize;


const moviesController = {
    'list': (req, res) => {
       Movie.findAll({
            include: [
                {association: 'actors'}
            ] 
       })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
       Movie.findByPk(req.params.id,{ 
        include: [{association: 'actors'}],
        include: [{association: 'genre'}] })
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        Movie.findAll({
            where: {
                rating: {[Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies', {movies});
            });
    }, //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
        Genre.findall()
            .then(genres => {  
        return res.render('moviesAdd', {genres})
            })
    },
    create: function (req, res) {

        let errors = validationResult(req);

        if (errors.isEmpty()) {
            Movie.create({
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            })
            .then((movie => {
                return res.send(movie);
            }))
            .catch(error => console.log(error));
            
            res.redirect('/movies');
        } else {
            return res.render('moviesAdd.ejs', {
                errors: errors.mapped(),
                old: req.body
        });

        }
    },
    edit: function(req, res) {
        const MOVIE_PROMISE = Movie.findByPk(req.params.id);
        const GENRE_PROMISE = Genre.findAll();

        Promise.all([MOVIE_PROMISE, GENRE_PROMISE])
            .then(([movie, genres]) => {
                return res.render('moviesEdit.ejs', {movie, genres});
            })
            .catch(error => console.log(error));
    },
    update: function (req,res) {
        let errors = validationResult(req);

        if (errors.isEmpty()) {
        Movie.update({
            title: req.body.title,
            rating: req.body.rating,
            awards: req.body.awards,
            release_date: req.body.release_date,
            length: req.body.length,
            genre_id: req.body.genre_id
            }, {
                where: {
                    id: req.params.id
                    }
                })
                .then((response) => {
                    if(response){
                    return res.redirect("/movies/detail/" + req.params.id);
                    } else {
                     throw new Error("No se pudo actualizar el registro");
                    }
                })
                .catch(error => console.log(error));
            

            } else {
                Movie.findByPk(req.params.id)
            .then(Movie => {
                res.render('moviesEdit.ejs', {Movie,
                    errors: errors.mapped(),
                    old: req.body});
            });
            }
    },
    delete: function (req, res) {
        Movie.findByPk(req.params.id)
            .then(Movie => {
                res.render('moviesDelete.ejs', {Movie});
            })
            .catch(error => console.log(error));
    },
    destroy: function (req, res) {
        Movie.destroy({
            where: {
                id: req.params.id
            }
        })
        .then((response) => {
            if(response){
            return res.redirect("/movies");
            } else {
                throw new Error("No se pudo eliminar el registro");
            }
        })
        .catch(error => console.log(error));
    }

}

module.exports = moviesController;