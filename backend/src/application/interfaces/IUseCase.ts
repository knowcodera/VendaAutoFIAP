export interface IUseCase<InputType, OutputType> {
  execute(input: InputType): Promise<OutputType>;
} 