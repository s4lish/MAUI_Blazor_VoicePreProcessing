using Services.DTO;

namespace Services.VoiceService
{
    public interface IVoiceService
    {
        Task<bool> Upload(Voiceinfo voiceinfo);
    }
}
