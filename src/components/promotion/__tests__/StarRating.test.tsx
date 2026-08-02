import { render, fireEvent } from '@testing-library/react-native';
import { StarRating } from '../StarRating';

// RNTL v14: `render` e `fireEvent` são assíncronos (retornam Promise).
describe('StarRating', () => {
  it('renderiza a nota acessível e o contador quando presente', async () => {
    const { getByLabelText, queryByText } = await render(
      <StarRating value={4.5} count={152} />,
    );

    expect(getByLabelText('Nota 4,5 de 5')).toBeTruthy();
    expect(queryByText('4,5 (152)')).toBeTruthy();
  });

  it('não mostra o contador quando count é omitido', async () => {
    const { queryByText } = await render(<StarRating value={4} />);
    expect(queryByText(/\(/)).toBeNull();
  });

  it('renderiza 5 estrelas tocáveis no modo interativo', async () => {
    const { getAllByRole } = await render(
      <StarRating value={3} onRate={jest.fn()} />,
    );
    expect(getAllByRole('button')).toHaveLength(5);
  });

  it('chama onRate com a nota certa ao tocar na estrela', async () => {
    const onRate = jest.fn();
    const { getByLabelText } = await render(
      <StarRating value={2} onRate={onRate} />,
    );

    await fireEvent.press(getByLabelText('Avaliar com 5 estrelas'));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith(5);
  });
});
