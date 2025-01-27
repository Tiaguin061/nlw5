import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { database } from '../../services/firebase';
import { useRoom } from '../../hooks/useRoom';
import { useAuth } from '../../hooks/useAuth';

import { Button } from '../../components/Button';
import { Question } from '../../components/Question';
import { RoomCode } from '../../components/RoomCode';
import { Header } from '../../components/Header';
import { UserInfo } from '../../components/UserInfo';

import deleteImg from '../../assets/images/delete.svg';
import checkImg from '../../assets/images/check.svg';
import answerImg from '../../assets/images/answer.svg';

import './styles.scss';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const { user } = useAuth();
  const params = useParams<RoomParams>();
  const history = useHistory();
  const roomId = params.id;
  const { questions, title, adminId } = useRoom(roomId);

  useEffect(() => {
    if (user?.id === null || (adminId !== '' && adminId !== user?.id)) {
      history.push(`/rooms/${roomId}`)
    }
  }, [user, history, adminId, roomId])


  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: true
    });

    history.push('/rooms/me');
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
      isHighLighted: false,
    });
  }

  async function handleHighlightQuestion(questionId: string, isHighLighted: boolean) {
    if(isHighLighted) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isHighLighted: false,
      });
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isHighLighted: true,
      });
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if(window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  return (
    <div id="page-admin-room">
      <Header>
        <div>
          <UserInfo 
            avatar={user?.avatar}
            name={user?.name}
          />
          <Button onClick={() => history.push('/rooms/me')}>Minhas salas</Button>
          <Button 
            onClick={handleEndRoom} 
            isOutlined
          >
            Encerrar sala
          </Button>
        </div>
      </Header>

      <main>
        <div className="details">
          <RoomCode code={roomId} />
          <div className="room-title">
            <h1>Sala {title}</h1>
            {questions.length > 0 && (
              <span>{questions.length} perguntas</span>
              )}
          </div>
        </div>

        <div className="question-list">
          {questions.map(question => (
            <Question
              key={question.id} 
              content={question.content}
              author={question.author}
              isAnswered={question.isAnswered}
              isHighlighted={question.isHighLighted}
            >
              {!question.isAnswered ? (
                <>
                  <span>Likes: {question.likeCount}</span>
                  <button
                    type="button"
                    onClick={() => handleCheckQuestionAsAnswered(question.id)}
                  >
                    <img src={checkImg} alt="Marcar pergunta como respondida" />
                  </button>
    
                  <button
                    type="button"
                    onClick={() => handleHighlightQuestion(question.id, question.isHighLighted)}
                  >
                    <img src={answerImg} alt="Dar destaque à pergunta" />
                  </button>
                </>
              ): <span>Pergunta respondida</span>}
              <button
                type="button"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                <img src={deleteImg} alt="Remover pergunta" />
              </button>
            </Question>
          ))}
        </div>
      </main>
    </div>
  )
}