import React from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";
import { useDispatch, useSelector } from "react-redux";
import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { useSelect } from "@mui/base";
import { selectIsAuth } from "../../redux/slices/auth";
import { useNavigate, Navigate, useParams } from "react-router";

import axios from "../../axios"

export const AddPost = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const isAuth = useSelector(selectIsAuth)
  const [isLoading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");
  const [title, setTitle] = React.useState("")
  const [tags, setTags] = React.useState("")
  const inputFileRef = React.useRef(null)
  const [imageUrl, setImageUrl] = React.useState("")

  const isEditing = Boolean(id)


  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);



  const onSubmit = async () => {
    try {
      setLoading(true)
      const fields = {
        title,
        imageUrl,
        tags: tags,
        text
      }
      const { data } =  isEditing 
      ? await axios.patch(`/posts/${id}`, fields)
      : await axios.post('/posts', fields)


      const _id = isEditing ? id : data._id

      navigate(`/posts/${_id}`)
    } catch (error) {
      console.log(error)
      alert("Article error")
    }

  }


  const onChangeFile = {
    
  }
  const handleChangeFile = async (event) => {
    try{
      const formData = new FormData()
      const file = event.target.files[0]
      formData.append('image', file)
      const { data } = await axios.post('/upload',formData)
      setImageUrl(data.url)
    }catch(error){
      console.warn(error)
      alert("Ошибка при загрузке картинки")

    }
  }
  const onClickRemoveImage = () => {
    if(window.confirm("are you sure?")){
      setImageUrl('')
    }
    
  }


  React.useEffect(() => {
    if(id){
      axios
      .get(`/posts/${id}`)
      .then(({data}) => {
        setTitle(data.title)
        setText(data.text)
        setImageUrl(data.imageUrl)
        setTags(data.tags.join(','))
      }).catch(err => {
        console.warn(err)
        alert("Ошибка при получении статьи")
      })
    } 
},[])



  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );
  if(!window.localStorage.getItem('token') && !isAuth){
    return <Navigate to='/'/>
  }
  console.log({title, tags, text})

  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Загрузить превью
      </Button>
      <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden/>
      {
        imageUrl && (
          <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
          Remove
          </Button>
          <img className={styles.image} src={`${process.env.REACT_APP_API_URL}${imageUrl}`} alt="" />
          </>
        )
      }
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          (isEditing ? id : data._id)
        </Button>
        <Button size="large">Отмена</Button>
      </div>
    </Paper>
  );
};
