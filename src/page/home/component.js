import styled from 'styled-components';

export const Container = styled.div`
  margin: 2% 5%;
  width: ${({ size, boxSize }) => boxSize * size}px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Box = styled.div`
  width: ${({ boxSize }) => boxSize }px;
  height: ${({ boxSize }) => boxSize }px;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ revealed }) => revealed ? 'not-allowed' : 'pointer' }
`;

export const Field = styled.div`
  display: flex;
  justify-content: flex-start;
`;
