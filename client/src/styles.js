import styled from 'styled-components';

const VideoContainer = styled.div`
  border: solid 1px black;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
const Video = styled.video`
  width: 50%;
`
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`


export {
  VideoContainer,
  Video,
  ButtonContainer
}