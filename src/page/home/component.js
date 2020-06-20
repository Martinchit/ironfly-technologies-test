import styled from 'styled-components';

export const Container = styled.div`
  margin: 5%;
  width: 400px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Box = styled.div`
  width: 40px;
  height: 40px;
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
